import os
import pandas as pd
import numpy as np

def select_hospital(df,hospital):
    '''
    select out specific hospital
    '''
    
    dfh = df.copy()

    dfh.loc[df.Hospital != hospital,'Hospital'] = 'other'
    
    return dfh

#################################

def data_last_N_events(df,n):
    
    d = df.tail(n)
    
    return d[['date','toc_mins']]

#################################

def data_transfers_compare(df):
    
    
    #last 7 days
    en = df.tail(1).date.values[0]
    st =  en - pd.Timedelta(days=7)

    last7 = df[((df.date >= st) & (df.date <=en))]

    #previous 7 days
    en = st
    st =  en - pd.Timedelta(days=7)

    prev7 = df[((df.date >= st) & (df.date <=en))]

    #week 30 days ago
    en = df.tail(1).date.values[0] - pd.Timedelta(days=30)
    st = en - pd.Timedelta(days=7)

    prev30 = df[((df.date >= st) & (df.date <=en))]

    #same week a year ago
    en = df.tail(1).date.values[0] - pd.Timedelta(days=365)
    st = en - pd.Timedelta(days=7)

    lastyear7 = df[((df.date >= st) & (df.date <=en))]
    
    '''
    create trans_df dataframe
    '''
    trans_df = pd.DataFrame()

    epochs = ['last_7','prev_7','prev30','year_ago']
    datas = [last7,prev7,prev30,lastyear7]

    for hospital in df.Hospital.unique():

        for t,d in zip(epochs,datas):

            d_ = d[d.Hospital == hospital]

            toc_over = d_.toc_over.mean()

            if hospital == 'other':
                volume_per_week = d_.shape[0] / 7 # there are a total of 6 hospitals in contra costa county

            else:
                volume_per_week = d_.shape[0]


            trans_df = trans_df.append(pd.DataFrame(data = {'hospital':hospital,
                                            'time':t,
                                            'toc_over':toc_over,
                                            'toc_under': np.abs(np.array(toc_over) - 1),
                                            'volume_per_week': volume_per_week},index=[0]))


    for hospital in df.Hospital.unique():
        d_ = trans_df[trans_df.hospital == hospital]

        diffs = d_[d_.time=='last_7'].toc_under - d_.toc_under

        trans_df.loc[trans_df.hospital == hospital,'toc_diff'] = diffs*100

    trans_df.index = np.arange(trans_df.shape[0])

    
    return trans_df