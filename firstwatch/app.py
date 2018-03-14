# import some stuff here
from flask import Flask
from flask import render_template, request

# modeling packages
import pandas as pd
import numpy as np
import firstwatch_utils as fw

# create the flask object
app = Flask(__name__)

# routes go here
@app.route('/')
def home():
    return 'Hello World!'

# main hospital report page
@app.route('/hospitalreport')

def hospitalreport():
    df = pd.read_csv('data/transfers_incounty_cleaned_2017-18.csv')

    hospital_name = request.args.get('hospital')

    d = fw.data_last_N_events(df,200)

    return render_template("startertemplate.html",hospital=hospital_name)




# script initialization
if __name__ == '__main__':
    app.run(debug=True)