import { SupportResistance } from '../../model/supportResistance';

export async function floor(low: number, high: number, close: number)
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
    const support1 = (2 * pivotPoint) - high;
    const support2 = pivotPoint - high + low;
    const support3 = low - (2 * (high - pivotPoint));
    const resistance1 = (2 * pivotPoint) - low;
    const resistance2 = pivotPoint + high - low;
    const resistance3 = high + (2 * (pivotPoint - low));

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
