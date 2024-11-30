export const DragAction = {
    SetTrue: true,
    SetFalse: false,
    SetUndefined: undefined,
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type DragAction = (typeof DragAction)[keyof typeof DragAction];
