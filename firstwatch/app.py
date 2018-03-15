# import some stuff here
from flask import Flask
from flask import render_template, request, jsonify

# modeling packages
import pandas as pd
import numpy as np
import firstwatch_utils as fw

global df
df = pd.read_csv('data/transfers_cleaned_2017-18.csv',index_col=0)

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
def hospital_data(hospital="PES", date="02-12-2018"):
    global df
    #get list of in county and out of county hospitals
    in_county_hospitals = df[df.in_county == 1].hospital.unique().tolist()
    out_county_hospitals = df[df.in_county == 0].hospital.unique().tolist()

    #get last N events for scatter plot
    last_n_events = fw.last_N_events_dict(df,hospital=hospital,end_date=date,days=7)

    # change the data to be 'ref hospital' vs. 'other'
    dfh = fw.select_hospital(df,hospital)
    # compute trans_df
    dft = fw.data_transfers_compare(dfh,date)

    event_data = fw.select_hospital_events(df, hospital=hospital,date=date).to_dict(orient='records')
    print(event_data)
    print('_______')
    # print(event_data.to_dict())

    #create output dictionary for viz
    data_dict = fw.df_to_dict(dft)
    print(data_dict)
    return render_template("first-watch.html",
                           fractions=data_dict["fraction_data"],
                           hospital=hospital,
                           date=date,
                           scatter=last_n_events,
                           changes=data_dict["changes"],
                           eventdata=event_data,
                           in_county_hospitals = in_county_hospitals,
                           out_county_hospitals = out_county_hospitals
                           )


# script initialization
if __name__ == '__main__':
    app.run(debug=True)