from controlflow import Flow
from flask import Flask, request, render_template, flash, url_for, redirect

import json

app = Flask(__name__)
processor = None

DEMO = """# Recursive Fibonacci series
import functools

@functools.lru_cache(maxsize=None) #128 by default
def fib(num):
    if num < 2:
        return 1
    else:
        return fib(num-1) + fib(num-2)

fib(5)
"""


@app.route("/",  methods=['GET'])
def index():
    return render_template('index.html', example=json.dumps(DEMO))

@app.route("/visualize/", methods=['POST'])
def visualize():
    code = request.form.get("pycode", None)

    if code is None:
        redirect("/")

    code = code.replace("\r\n", "\n")

    data = dict()
    init()
    data["delta"], data["branches"], data["early_stop"] = processor.process_script(code)

    code = [None] + [line.strip() for line in code.split("\n")]
    
    data["lines"] = code
    data["line_count"] = len(code)
    data["edges"] = list(map(lambda edge: (code[edge[0]], code[edge[1]]), data["branches"]))

    json_data = json.dumps(data)

    return render_template("visualize.html", data=json_data)


def init():
    global processor
    processor = Flow()


if __name__ == "__main__":
    app.run(debug=True, port=8000)
