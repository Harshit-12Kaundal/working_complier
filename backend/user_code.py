try:
    num1, num2 = map(int, input().split())
    sum = num1 + num2
    print(sum)
except Exception as e:
    print('Error:', e)