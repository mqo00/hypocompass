def first_num_greater_than(numbers_list, key):
    for i in range(len(numbers_list)):
        if numbers_list[i] > key:
            return numbers_list[i]
    return None