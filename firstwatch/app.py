# import some stuff here
from flask import Flask
from flask import render_template, request

# modeling packages
import pandas as pd
import numpy as np
import firstwatch_utils as fw

global df
df = pd.read_csv('data/transfers_cleaned_2017-18.csv')

# create the flask object
app = Flask(__name__)

# routes go here
@app.route('/')
def home():
    return 'Hello World!'

# main hospital report page
@app.route('/hospitalreport')
def hospitalreport():
    global df
    dates = df.date_day.unique()

    hospital_name = request.args.get('hospital')

    d = fw.data_last_N_events(df,200)

    return render_template("startertemplate.html",dates=dates)

@app.route('/hospital-data/<string:hospital>/<string:date>')
def hospital_data(hospital, date):
    global df

    # change the data to be 'ref hospital' vs. 'other'
    dfh = fw.select_hospital(df,hospital)
    # compute trans_df 
    dft = fw.data_transfers_compare(dfh,date)
    #create output dictionary for viz
    data_dict = fw.df_to_dict(dft)
    print(data_dict)
    return "hi"


# script initialization
if __name__ == '__main__':
    app.run(debug=True)