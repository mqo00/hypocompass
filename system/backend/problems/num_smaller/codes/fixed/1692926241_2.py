def num_smaller(seq, x):
    count = 0
    for i in range(len(seq)):
        if seq[i] < x:
            count += 1
    return count