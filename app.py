# import some stuff here
from flask import Flask

# create the flask object
app = Flask(__name__)

# routes go here
@app.route('/')
def home():
    return 'Hello World!'


# script initialization
if __name__ == '__main__':
    app.run(debug=True)