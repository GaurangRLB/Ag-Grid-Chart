export async function getData(delay: number = 100): Promise<any[]> {
    // Simulate a server delay using setTimeout wrapped in a Promise
    return await new Promise<any[]>((resolve) => setTimeout(() => resolve(generateChartData(new Date(),32)), delay));
}

export function generateChartData(startDate: Date, months: number): any[] {
    let baseline = 0; // Starting baseline value
    let forecast = 0; // Starting forecast value
    let contractorForecast = 0; // Starting contractor forecast value
    let actual = 0; // Starting actual value
    return Array.from({ length: months }, (_, index) => {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + index + 1, 0); // Last day of each month

        actual += Math.floor(Math.random() * 1000000 + 10); // Random actual value
        baseline += Math.floor(Math.random() * 3000000 + 20); // Cumulative baseline
        forecast += Math.floor(Math.random() * 3000000 + 20); // Cumulative forecast
        contractorForecast += Math.floor(Math.random() * 1500000 + 300); // Cumulative forecast
        const actualMonthly = Math.floor(Math.random() * 19000000 + 100); // Random monthly actual value
        const forecastMonthly = Math.floor(Math.random() * 19000000 + 200); // Random monthly actual value
        return {
            date: date, // Format date as YYYY-MM-DD
            baseline,
            actual,
            forecast,
            contractorForecast,
            actualMonthly,
            forecastMonthly
        };
    });
}


export function deepMerge(obj1: any, obj2: any): any {
    const output = { ...obj1 };

    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
                output[key] = deepMerge(obj1[key] || {}, obj2[key]);
            } else {
                output[key] = obj2[key];
            }
        }
    }

    return output;
}