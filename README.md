# Processing_Control

## Installation
#### Required tools
- install nodejs    
  1. https://nodejs.org/en/download/
  2. sudo apt-get install nodejs

#### Required nodejs modules
```
cd Processing_Control
npm install
```

## How to start
```
sudo node server.js
```

## Set join function on IotTalk
```python
import math
def run(*args):
    sum = 0
    for axis in args:
        sum = sum + (axis * axis)
    normal = math.sqrt(sum)
    if normal > 75.0:
        normal = 75.0
    elif normal < 10.0:
        normal = 10.0
    normal = ((normal - 10.0) * 10.0) / 65.0;
    return normal
```
