type FieldMap<ObjectT> = {
    [KeyT in keyof ObjectT]?: (fieldValue: ObjectT[KeyT], objectValue: ObjectT) => void | boolean;
};

export class ObjectParser<ObjectT> {
    constructor(private fieldMap: FieldMap<ObjectT>) {}

    parse(object: ObjectT, objectDescriptionForDebug = "object") {
        if (typeof object !== "object" || object === null || object instanceof Array) {
            throw new Error("Failed to parse object - not an object given");
        }

        for (const key of Object.keys(object) as (keyof ObjectT)[]) {
            if (!(key in this.fieldMap)) {
                console.warn(`Unsupported feature "${key}" while parsing ${objectDescriptionForDebug}, value is`, object[key]);
            }
        }

        for (const key of Object.keys(this.fieldMap) as (keyof ObjectT)[]) {
            if (this.fieldMap[key]?.(object[key], object) === false) {
                console.warn(`Unsupported feature "${key}" while parsing ${objectDescriptionForDebug}, value is`, object[key]);
            }
        }
    }

    static empty = new ObjectParser<any>({});
}
