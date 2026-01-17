/**
 * 通用工具类型
 */

/**
 * 使对象的某些属性变为可选
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 使对象的某些属性变为必需
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * 深度只读
 */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 异步函数返回类型
 */
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> =
    T extends (...args: unknown[]) => Promise<infer R> ? R : never;

/**
 * 可空类型
 */
export type Nullable<T> = T | null;

/**
 * 可选类型
 */
export type Optional<T> = T | undefined;

/**
 * 回调函数类型
 */
export type Callback<T = void> = () => T;
export type AsyncCallback<T = void> = () => Promise<T>;

/**
 * 事件处理器类型
 */
export type EventHandler<E = Event> = (event: E) => void;

/**
 * 键值对记录
 */
export type StringRecord<T> = Record<string, T>;
