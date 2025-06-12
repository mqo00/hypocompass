def remove_extras(lst):
    new_lst = []
    for i in range(len(lst)):
        if lst.count(lst[i]) < 2:
            new_lst.append(lst[i])
    return new_lst