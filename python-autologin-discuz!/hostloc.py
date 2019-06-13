import re
import ssl
import textwrap

import urllib3
from bs4 import BeautifulSoup

import aes

import pathlib

import random

urllib3.disable_warnings()


class HostLoc(object):

    userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:67.0) Gecko/20100101 Firefox/67.0"


    loginFromUrl = "/member.php?mod=logging&action=login&loginsubmit=yes&infloat=yes&lssubmit=yes&inajax=1"

    referer = "/forum-45-1.html"

    creditUrl = "/home.php?mod=spacecp&ac=credit&showcredit=1&inajax=1&ajaxtarget=extcreditmenu_menu"

    host = None

    http = None

    cookies = {}

    origin_cookies = None

    visit_loop = 0

    username = None

    password = None

    identity_cookie_name = None

    def __init__(self, username, password, host, identity_cookie_name):
        self.host = host
        self.loginFromUrl = self.host + self.loginFromUrl
        self.referer = self.host + self.referer
        self.creditUrl = self.host + self.creditUrl
        self.http = urllib3.PoolManager(cert_reqs=ssl.CERT_NONE, assert_hostname=False)
        self.username = username
        self.password = password
        self.origin_cookies = self.readCookie()
        self.identity_cookie_name = identity_cookie_name

        self.open_file = open('./cookie.txt', 'w')

        if self.origin_cookies != None:
            for value in self.origin_cookies.split(";"):
                hash = value.split("=")
                self.cookies[hash[0]] = hash[1]

    def is_login(self):
        if self.identity_cookie_name in self.cookies:
            return True
        return False

    def login(self):

        response = self._request("post", self.loginFromUrl, fields={
           "fastloginfield": "username",
           "username": self.username,
           "password": self.password,
           "quickforward": "yes",
           "handlekey": "ls"
        })

        if response.status == 400:
            print("服务器已限制")
            return False


        if self.identity_cookie_name in self.cookies:
            print("登录成功")
            return True

        return False

    def info(self):
        response = self._request(
            "post",
            self.referer
        )
        bs = BeautifulSoup(response.data, "lxml")

        score = bs.find("a", id="extcreditmenu").string
        name = bs.find("strong", class_="vwmy").string

        menu_response = self._request("get", self.creditUrl)
        menu_response_bs = BeautifulSoup(menu_response.data, "lxml")

        hcredit_1 = menu_response_bs.find("span", id="hcredit_1").string
        hcredit_2 = menu_response_bs.find("span", id="hcredit_2").string


        first = self.host + "/" + bs.find("a", class_="notabs")["href"]


        print("昵称: %s, %s\n威望: %s, 金钱: %s" % (name, score, hcredit_1, hcredit_2))

        self.visitProfile(first)

    def visitProfile(self, url):
        response = self._request("get", url)
        print(url + "\n")
        bs = BeautifulSoup(response.data, "lxml")
        self.visit_loop += 1

        all = bs.find_all("a", class_="avt")

        visit_len = len(all)
        print(visit_len)
        if visit_len > 1 and self.visit_loop < 20:
            index = random.randint(2, visit_len - 1)
            self.visitProfile(self.host + "/" + all[index]['href'])

    def _request(self, method, url, fields = None):
        headers = {
            "origin": self.host,
            "referer": self.referer,
            "User-Agent": self.userAgent,
        }
        if len(self.cookies) > 0:
            headers['cookie'] = self.joinCookies()

        response = self.http.request(
            method,
            url,
            fields,
            headers
        )

        cookies = self.parseCookie(response.getheader('Set-Cookie'))
        if len(cookies) > 0:
            self.cookies.update(cookies)

        body = response.data.decode("utf-8")
        if self.checkAesCookie(body):
            return self._request(method, url, fields)
        if self.checkReLogin(body):
            return self._request(method, url, fields)
        return response

    def toNumbers(self, secret):
        text = []
        for value in textwrap.wrap(secret, 2):
            text.append(int(value, 16))

        return text
    def decodeAesCookie(self, cipher, key, iv):
        moo = aes.AESModeOfOperation()
        # cypherkey = [3, 3, 65, 141, 203, 36, 14, 198, 158, 46, 154, 130, 27, 93, 31, 188]
        # iv = [12, 59, 146, 152, 218, 142, 164, 13, 237, 8, 170, 85, 233, 5, 215, 36]
        # ciph = [119, 32, 86, 166, 101, 141, 227, 106, 205, 112, 219, 75, 238, 153, 134, 107]
        mode =  moo.modeOfOperation["CBC"]

        decr = moo.decrypt(cipher, 8, mode, key,
                moo.aes.keySize["SIZE_128"], iv)
        return bytes(decr).hex()

    def writeCookie(self, cookie):
        self.open_file.write(cookie)
        self.open_file.close()

    def readCookie(self):
        if not pathlib.Path("./cookie.txt").exists():
            return None
        with open('cookie.txt', 'r') as f:
            return f.read()

    def parseCookie(self, cookie = None):
        cookies = {}
        if cookie == None:
            return cookies
        for value in  cookie.split(";"):
            hash = value.split("=")
            if len(hash) < 2 or hash[0].strip(" ") in ["expires", "Max-Age", "path"]:
                continue
            name = hash[0]
            index = hash[0].find(',')
            if index != -1:
                name = name[index+1:].lstrip(" ")

            cookies[name] = hash[1]
        return cookies

    def joinCookies(self):
        cookie_string = ""
        for key, value in self.cookies.items():
            cookie_string += key + "=" + value + ";"
        return cookie_string.rstrip(";")

    def checkAesCookie(self, body):
        aesNumbers = re.findall("toNumbers\(\"(.*?)\"\)?", body)
        # key, iv, cipherIn, CBC
        if len(aesNumbers) > 0:
            print(aesNumbers)
            aesCookie = self.decodeAesCookie(
                self.toNumbers(aesNumbers[2]), self.toNumbers(aesNumbers[0]), self.toNumbers(aesNumbers[1])
            )
            print(aesCookie)
            self.cookies["L7FW"] = aesCookie
            print("加密成功:L7FW=" + aesCookie)
            return True
        return False

    def checkReLogin(self, body):
        match = re.findall("请先登录后才能继续浏览", body)
        if len(match) > 0:
            self.cookies = {}
            self.login()
            return True
        return False

    def __del__(self):
        if len(self.cookies) > 0:
            self.writeCookie(self.joinCookies())


if __name__ == "__main__":
    tb = HostLoc("username", "password", "https://www.hostloc.com", "hkCM_2132_auth")
    if tb.is_login() == False:
        tb.login()
    tb.info()


