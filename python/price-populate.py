import requests, random, time

for i in range(random.randint(60, 150)):
  burp0_url = "http://localhost:8878/simulation/modify"
  burp0_cookies = {"__gads": "ID=8cb56abd939ca48e-2239cb60d6e7004b:T=1697538247:RT=1699532703:S=ALNI_MZyOftbP0Gmmv_yvVm6v2FIOiyjUw", "__gpi": "UID=00000c6523baeff7:T=1697538247:RT=1699532703:S=ALNI_MbX9pkGUBnuTRvovj9HPWiLGuLGbQ", "_ga_SL0FLTCQ09": "GS1.1.1700822579.51.1.1700824300.0.0.0", "_ga": "GA1.1.1261188528.1698400529", "_ga_EQDN3BWDSD": "GS1.1.1701176327.1.1.1701176336.0.0.0", "_ga_R58Z1BJNF0": "GS1.1.1703494503.57.1.1703495782.0.0.0", "connect.sid": "s%3ABlJM14hzopZLzO9ye6IeDpXeLboDxDbQ.0YGBVWRvQGX%2BJdd0qOHzFTwDJlCDnirsSKevcvgYIa0", "pga4_session": "cb9969f1-10bb-4982-8b2c-200895b23c3e!HN+6Ub4tOB00uhQe4BWSLHues/yp/QVa0p5zC8X4y/8=", "PGADMIN_LANGUAGE": "en"}
  burp0_headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0", "Accept": "application/json, text/plain, */*", "Accept-Language": "en-US,en;q=0.5", "Accept-Encoding": "gzip, deflate, br", "Content-Type": "application/json", "Origin": "http://localhost:3000", "Connection": "close", "Referer": "http://localhost:3000/", "Sec-Fetch-Dest": "empty", "Sec-Fetch-Mode": "cors", "Sec-Fetch-Site": "same-site"}
  burp0_json={"amount": random.randint(1, 100) * ( 1 if random.randint(1, 2) == 1 else - 1) }
  req = requests.post(burp0_url, headers=burp0_headers, cookies=burp0_cookies, json=burp0_json)
  print(req.status_code, time.time())
  time.sleep(0.2)