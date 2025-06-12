def remove_extras(lst):
    new_lst = []
    for num in lst:
        if lst.count(num) != 1:
            new_lst.append(num)
    return new_lst