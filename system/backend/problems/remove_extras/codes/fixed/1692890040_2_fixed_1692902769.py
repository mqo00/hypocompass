def remove_extras(lst):
    new_lst = []
    for num in lst:
        if num in new_lst:
            continue
        else:
            new_lst.append(num)
    return new_lst