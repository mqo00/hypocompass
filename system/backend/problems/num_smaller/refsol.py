def num_smaller(seq, x):
    for i in range(len(seq)):
        if x <= seq[i]:
            return i
    return len(seq)