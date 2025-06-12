def num_smaller(seq, x):
    count = 0
    for num in seq:
        if num < x:
            count += 1
    return count