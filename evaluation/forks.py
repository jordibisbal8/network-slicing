import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


df = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/forks/forks_pow.csv')

x = np.arange(0.0, 100, 1)

data = df[['T1', 'T2','T3','T4', 'T5','T6','T7', 'T8','T9','T10', 'T11','T12','T13', 'T14','T15','T16', 'T17','T18','T19', 'T20','T21','T21', 'T22','T23','T24', 'T25','T26','T27', 'T28','T29','T30']]

ax = plt.subplot()

ax.errorbar(x, data.mean(axis=1), yerr=data.std(axis=1) * 2, fmt='.')

plt.xlabel('# blocks')
plt.ylabel('# forks '  + '$f_b$')
plt.grid(linestyle=':',linewidth=1.5)


# Hide the right and top spines
ax.spines['right'].set_visible(False)
ax.spines['top'].set_visible(False)

ax.set_xlim(xmin=0, xmax=100)
ax.set_ylim(ymin=0, ymax=100)

plt.savefig('ev_forks_pow.png')
plt.show()
