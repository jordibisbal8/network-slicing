import matplotlib.pyplot as plt
import numpy as np

#Price depending on lifetime


def f(x, t):
    return x + 1 / np.exp(-t)

t1 = np.arange(0.0, 5.0, 0.1)

ax = plt.subplot()
ax.plot(t1, f(20, t1), 'b', label='L2')
ax.plot(t1, f(30, t1), 'r', label='L1')

ax.errorbar(t1, f(20, t1), yerr=5, fmt='.')
ax.errorbar(t1, f(30, t1), yerr=3, fmt='.')
plt.xlabel('arrival rate ' + r'$\lambda$')
plt.ylabel('E['r'$\frac{\alpha}{req}]$')
plt.grid(linestyle=':',linewidth=1.5)

# Hide the right and top spines
ax.spines['right'].set_visible(False)
ax.spines['top'].set_visible(False)

ax.set_xlim(xmin=0, xmax=5)
ax.set_ylim(ymin=0, ymax=160)
ax.legend(loc=4)

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
