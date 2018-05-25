import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

medianprops = dict(color="r")
whiskerprops = dict(linestyle='--')

df = pd.read_csv('/home/jordibisbal/WS18-MSc-JordiBisbalAnsaldo--NetworkSlicing/evaluation/experiments/1/blockTime/blockTime.csv')

dfx=df[['InP1', 'InP2','InP3','InP4','InP5']]

data = [dfx['InP1'], dfx['InP2'], dfx['InP3'] ,dfx['InP4'], dfx['InP5']]

"""
#Analytic block time
max_time = 10;
A = zeros(10,10,10,10,10);
for i = 1:max_time
   for j = 1:max_time
      for k = 1:max_time
        for l = 1:max_time
           for m = 1:max_time
        A(i,j,k,l,m) = min([i,j,k,l,m]);
           end
        end
      end
   end
end
B = mean(mean(mean(mean(mean(A)))))
"""

fig, ax = plt.subplots(figsize=(7,5))

ax.boxplot(data, 0, '', medianprops=medianprops,whiskerprops=whiskerprops)
plt.plot([1,2,3,4,5,6], [5.5,3.85,3.025,2.53,2.2083,1.9784], 'ro', label= "analytical")
plt.plot([1,2,3,4,5,6], [-1,-1,-1,-1,-1,-1], 'ro', label= "real-world")

ax.yaxis.grid(linestyle=':',linewidth=1.5)
ax.set_xlim(xmin=0)
ax.set_ylim(ymin=0, ymax=10)
ax.legend()

plt.xlabel('# InPs')
plt.ylabel('average block time ' + 'E[' + r'$t_b]$')

plt.savefig('ev_block_time.png')
plt.show();
