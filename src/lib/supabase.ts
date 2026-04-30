// ====== Mock Supabase Client — localStorage backend ======

type Row = Record<string, any>;
type SupabaseResult = { data: Row[] | null; error: { message: string } | null };

const PREFIX = 'mockdb_';

function genId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getTable(name: string): Row[] {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setTable(name: string, rows: Row[]): void {
  localStorage.setItem(PREFIX + name, JSON.stringify(rows));
}

class QueryBuilder {
  private _table: string;
  private _filters: Array<[string, any]> = [];
  private _orderCol?: string;
  private _orderAsc = true;
  private _op: 'select' | 'insert' | 'update' = 'select';
  private _insertData?: Row | Row[];
  private _updateData?: Row;

  constructor(table: string) {
    this._table = table;
  }

  select(_cols?: string): this {
    if (this._op !== 'insert' && this._op !== 'update') {
      this._op = 'select';
    }
    return this;
  }

  insert(data: Row | Row[]): this {
    this._op = 'insert';
    this._insertData = data;
    return this;
  }

  update(data: Row): this {
    this._op = 'update';
    this._updateData = data;
    return this;
  }

  eq(col: string, val: any): this {
    this._filters.push([col, val]);
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }): this {
    this._orderCol = col;
    this._orderAsc = opts?.ascending !== false;
    return this;
  }

  then<T1 = SupabaseResult, T2 = never>(
    onfulfilled?: ((v: SupabaseResult) => T1 | PromiseLike<T1>) | null,
    onrejected?: ((r: any) => T2 | PromiseLike<T2>) | null
  ): Promise<T1 | T2> {
    return Promise.resolve(this._exec()).then(onfulfilled, onrejected);
  }

  catch<T = never>(
    onrejected?: ((r: any) => T | PromiseLike<T>) | null
  ): Promise<SupabaseResult | T> {
    return Promise.resolve(this._exec()).catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<SupabaseResult> {
    return Promise.resolve(this._exec()).finally(onfinally);
  }

  private _exec(): SupabaseResult {
    try {
      let rows = getTable(this._table);

      if (this._op === 'select') {
        for (const [col, val] of this._filters) {
          rows = rows.filter(r => r[col] === val);
        }
        if (this._orderCol) {
          const col = this._orderCol;
          const asc = this._orderAsc;
          rows = [...rows].sort((a, b) => {
            if (a[col] < b[col]) return asc ? -1 : 1;
            if (a[col] > b[col]) return asc ? 1 : -1;
            return 0;
          });
        }
        return { data: rows, error: null };
      }

      if (this._op === 'insert') {
        const arr: Row[] = Array.isArray(this._insertData)
          ? (this._insertData as Row[])
          : [this._insertData as Row];
        const now = new Date().toISOString();
        const inserted = arr.map(item => ({
          id: genId(),
          created_at: now,
          updated_at: now,
          ...item,
        }));
        setTable(this._table, [...rows, ...inserted]);
        return { data: inserted, error: null };
      }

      if (this._op === 'update') {
        const updated: Row[] = [];
        const newRows = rows.map(r => {
          if (this._filters.every(([col, val]) => r[col] === val)) {
            const u = { ...r, ...this._updateData, updated_at: new Date().toISOString() };
            updated.push(u);
            return u;
          }
          return r;
        });
        setTable(this._table, newRows);
        return { data: updated, error: null };
      }

      return { data: null, error: { message: 'Unknown operation' } };
    } catch (e: any) {
      return { data: null, error: { message: e?.message ?? 'Unknown error' } };
    }
  }
}

export const supabase = {
  from(table: string): QueryBuilder {
    return new QueryBuilder(table);
  },
};
