def first_num_greater_than(numbers_list, key):
    i = 0
    while i < len(numbers_list):
        if numbers_list[i] > key:
            return numbers_list[i]
        i
    return None