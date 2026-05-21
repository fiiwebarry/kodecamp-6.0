

const sharedElements = (arr1, arr2, arr3) => {
    const result = [];
    for (let i = 0; i < arr1.length; i++) {
        const value = arr1[i];
        if (arr2.includes(value) && arr3.includes(value) && !result.includes(value)) {
            result.push(value);
        }
    }
    return result;
};

 sharedElements([1, 2, 3, 4], [3, 4, 5], [3, 4, 5, 6]);


