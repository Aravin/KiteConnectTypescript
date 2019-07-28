import { SupportResistance } from '../../model/supportResistance';

export async function fibonacci(low: number, high: number, close: number)
    : Promise<[boolean, SupportResistance]>
{
    let result: SupportResistance =
    {
        p: 0,
        s1: 0,
        s2: 0,
        s3: 0,
        r1: 0,
        r2: 0,
        r3: 0,
    };

    if (low === undefined
        || low <= 0
        || high === undefined
        || high <= 0
        || close === undefined
        || close <= 0
        )
    {
        return [false, result];
    }

    const pivotPoint = (low + high + close) / 3;
    const support1 = pivotPoint - (high - low) * 0.382;
    const support2 = pivotPoint - (high - low) * 0.618;
    const support3 = pivotPoint - (high - low) * 1.000;
    const resistance1 = pivotPoint + (high - low) * 0.382;
    const resistance2 = pivotPoint + (high - low) * 0.618;
    const resistance3 = pivotPoint + (high - low) * 1.000;

    result =
    {
        p: pivotPoint,
        s1: support1,
        s2: support2,
        s3: support3,
        r1: resistance1,
        r2: resistance2,
        r3: resistance3,
    };

    return [true, result];
}
