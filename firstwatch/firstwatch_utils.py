import os
import pandas as pd
import numpy as np

def select_hospital(df,hospital):
    '''
    select out specific hospital
    '''
    
    dfh = df.copy()

    dfh.loc[df.hospital != hospital,'hospital'] = 'other'
    
    return dfh

#################################

def last_N_events_dict(df,hospital,end_date,days=7):
    
    en = pd.to_datetime(end_date)
    st = en - pd.Timedelta(days=days)
    
    df.date_day = pd.to_datetime(df.date_day)
    
    d = df[((df.hospital == hospital) & (df.date_day >= st) & (df.date_day <=en))]
    
    d_dict = {'transfer_times':d.toc_mins.values,'times': d.date.values}
    

    return d_dict

#################################

def data_transfers_compare(df,date):
    
    #convert date into datetime object
    date = pd.to_datetime(date)
    
    #convert dates back into datetime objects
    df.date_day = pd.to_datetime(df.date_day)

    #last 7 days
    en = date
    st =  en - pd.Timedelta(days=7)

    last7 = df[((df.date_day >= st) & (df.date_day <=en))]

    #previous 7 days
    en = st
    st =  en - pd.Timedelta(days=7)

    prev7 = df[((df.date_day >= st) & (df.date_day <=en))]

    #week 30 days ago
    en = date - pd.Timedelta(days=30)
    st = en - pd.Timedelta(days=7)

    prev30 = df[((df.date_day >= st) & (df.date_day <=en))]

    #same week a year ago
    en = date - pd.Timedelta(days=365)
    st = en - pd.Timedelta(days=7)

    lastyear7 = df[((df.date_day >= st) & (df.date_day <=en))]
    
    '''
    create trans_df dataframe
    '''
    trans_df = pd.DataFrame()

    epochs = ['this_wk','prev_wk','prev_month','prev_year']
    datas = [last7,prev7,prev30,lastyear7]

    for hospital in df.hospital.unique():

        for t,d in zip(epochs,datas):

            d_ = d[d.hospital == hospital]

            toc_over = d_.toc_over.mean()

            if hospital == 'other':
                volume_per_week = d_.shape[0] / 7 # there are a total of 8 hospitals in contra costa county

            else:
                volume_per_week = d_.shape[0]


            trans_df = trans_df.append(pd.DataFrame(data = {'hospital':hospital,
                                            'time':t,
                                            'toc_over':toc_over,
                                            'toc_under': np.abs(np.array(toc_over) - 1),
                                            'volume_per_week': volume_per_week},index=[0]))


    for hospital in df.hospital.unique():
        d_ = trans_df[trans_df.hospital == hospital]

        diffs = d_[d_.time=='this_wk'].toc_under - d_.toc_under

        trans_df.loc[trans_df.hospital == hospital,'toc_diff'] = diffs*100

    trans_df.index = np.arange(trans_df.shape[0])

    
    return trans_df


##################################

def df_to_dict(tdf):
    print(tdf)
    data_dict = {'fraction_data':
                    {'ref': tdf[((tdf.hospital != 'other') & (tdf.time == 'this_wk'))].toc_under.values[0], 
                    'others': tdf[((tdf.hospital == 'other') & (tdf.time == 'this_wk'))].toc_under.values[0]},
                'changes':
                    {'year':
                        {'ref':tdf[((tdf.hospital != 'other') & (tdf.time == 'prev_year'))].toc_diff.values[0],
                        'others': tdf[((tdf.hospital == 'other') & (tdf.time == 'prev_year'))].toc_diff.values[0]},
                    'month':
                        {'ref':tdf[((tdf.hospital != 'other') & (tdf.time == 'prev_month'))].toc_diff.values[0],
                        'others': tdf[((tdf.hospital == 'other') & (tdf.time == 'prev_month'))].toc_diff.values[0]},
                    'week':
                        {'ref':tdf[((tdf.hospital != 'other') & (tdf.time == 'prev_wk'))].toc_diff.values[0],
                        'others': tdf[((tdf.hospital == 'other') & (tdf.time == 'prev_wk'))].toc_diff.values[0]}}
                }
    return data_dict