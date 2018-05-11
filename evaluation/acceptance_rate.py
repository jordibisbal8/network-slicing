import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

df1 = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/acceptanceRate/acceptanceRate3_1.csv')
df2 = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/acceptanceRate/acceptanceRate3_2.csv')
columns=['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','T13','T14','T15','T16','T17','T18','T19','T20','T21','T22','T23','T24','T25','T26','T27','T28','T29','T30']

dfx1=df1[columns]

dfx1['avg']=dfx1[columns].mean(axis=1) 


dfx1['std']= 1.96 * dfx1[columns].std(axis=1)/np.sqrt(30)

dfx2=df2[columns]

dfx2['avg']=dfx2[columns].mean(axis=1) 


dfx2['std']=1.96 * dfx2[columns].std(axis=1) / np.sqrt(30)


ax = plt.subplot()


ax.errorbar(dfx1.index, dfx1['avg'], dfx1['std'], color="b", fmt='.', label="L1")
ax.errorbar(dfx2.index, dfx2['avg'], dfx2['std'], color="r", fmt='.', label="L2")
plt.xlabel('#VNR')
plt.ylabel('acceptance rate ' + r'$\varphi$')
plt.grid(linestyle=':',linewidth=1.5)

# Hide the right and top spines
ax.spines['right'].set_visible(False)
ax.spines['top'].set_visible(False)

ax.set_xlim(xmin=0, xmax=100)
ax.set_ylim(ymin=0, ymax=1)
ax.legend(loc=4)

plt.savefig('ev_acceptance_rate.png')
plt.show()
