def first_num_greater_than(numbers_list, key):
    for num in numbers_list:
        if num > key:
            return num
        elif num == key:
            continue
    return None