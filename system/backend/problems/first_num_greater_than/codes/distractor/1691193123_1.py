def first_num_greater_than(numbers_list, key):
    num_greater_than_key = None

    for num in numbers_list:
        if num > key:
            num_greater_than_key = num
            break

    return numbers_list