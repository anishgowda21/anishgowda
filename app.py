from flask import jsonify, Flask, request
from parse import getData
import os
app = Flask(__name__)


@app.route('/')
def home():
    return 'Udemy API is UP!'


@app.route('/udemy')
def news():
    if request.method == 'GET':
        return jsonify(getData())


if __name__ == '__main__':
    app.run(debug=True, threaded=True, port=int(
        os.environ.get('PORT', "8080")))
