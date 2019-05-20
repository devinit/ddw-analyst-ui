
import sys
import time

def reporthook(count, block_size, total_size):
    global start_time
    if count == 0:
        start_time = time.time()
        return
    
    total_size = int(total_size)
    duration = time.time() - start_time
    progress_size = int(count * block_size)
    speed = int(progress_size / (1024 * duration))
    percent = min(int(count*block_size*100/total_size),100)
    if total_size == -1:
        sys.stdout.write("\r...NaN of NaN, %d MB, %d KB/s, %d seconds passed" %(progress_size / (1024 * 1024), speed, duration))
    else:
        sys.stdout.write("\r...%d%% of %d, %d MB, %d KB/s, %d seconds passed" %(percent,total_size, progress_size / (1024 * 1024), speed, duration))
    
    sys.stdout.flush()