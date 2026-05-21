
const flattenArray = (arr) => {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const sub = arr[i];
        if (Array.isArray(sub)) {
            for (let j = 0; j < sub.length; j++) {
                result.push(sub[j]);
            }
        } else {
            result.push(sub);
        }
    }
    return result;
};

flattenArray([[1, 2, 3], [4, 5], [6, 7, 8, 9]]);

