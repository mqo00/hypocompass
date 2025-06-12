def remove_extras(lst):
    new_lst = []
    for i in range(len(lst)):
        if lst[i] not in lst[i+1:]:
            new_lst.append(lst[i])
    return new_lst