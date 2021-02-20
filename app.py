from flask import jsonify, Flask, request
from parse import getData
from yts import getJson
import os
app = Flask(__name__)


@app.route('/')
def home():
    return 'Udemy API is UP!'


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
