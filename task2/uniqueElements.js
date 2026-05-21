
const uniqueElements = (arr) => {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        if (!result.includes(element)) {
            result.push(element);
        }
    }
    return result;
};

uniqueElements([1, 3, 2, 3, 4, 5, 4, 2, 5, 6]);

