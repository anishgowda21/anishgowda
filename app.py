from flask import jsonify, Flask, request
from parse import getData
from yts import getJson
import os
from flask_cors import CORS
app = Flask(__name__)
CORS(app)


@app.route('/')
def home():
    return 'Home page boiiiii!!!!!!!!!'


@app.route('/udemy')
def udemy():
    if request.method == 'GET':
        return jsonify(getData())


@app.route('/yts')
def yts():
    if request.method == 'GET':
        return jsonify(getJson(request.args.get('query')))


if __name__ == '__main__':
    app.run(debug=True, threaded=True, port=int(
        os.environ.get('PORT', "8080")))
