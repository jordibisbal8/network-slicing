import matplotlib.pyplot as plt
import numpy as np

#Price depending on lifetime


def f(x, t):
    return np.where(t != 1.0, x + 1.0 / (1-t), x + 1.0 / (1.0-0.999)) 

t1 = np.arange(0.0, 1.1, 0.01)

ax = plt.subplot()
ax.plot(t1, f(0.15, t1), 'r')
plt.xlabel('resource utilization ' +'$\mu$')
plt.ylabel('dynamic cost ' + r'$\alpha^{h}_{s^{*}}(N_i)$')
plt.grid(linestyle=':',linewidth=1.5)

# Hide the right and top spines
ax.spines['right'].set_visible(False)
ax.spines['top'].set_visible(False)

ax.set_xlim(xmin=0, xmax=1)
ax.set_ylim(ymin=0, ymax=20)
ax.legend(loc=4)

plt.savefig('6.png')
plt.show()



"""
names = ['group_a', 'group_b', 'group_c']
values = [1, 10, 100]

fig, axs = plt.subplots(1,3,figsize=(15,5))

axs[0].bar(names, values)
axs[1].scatter(names, values)
axs[2].plot(names, values)
plt.title('Categorical Plotting')
plt.show()
"""
