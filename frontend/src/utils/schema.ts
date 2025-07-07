export type Schema = {
    config: Config;
    pages: PageItem[];
}

type Config = {
    title: string;
}

export type PageItem = {
    key: string;
    title: string;
    columns: ColumnItem[];
}

type ColumnItem = {
    key: string;
    type: string;
    not_null: boolean;
    name: string;
    setter: string;
    setter_props: any;
}


export const mockSchema: Schema = {
    "config": {
        "title": "图书管理系统"
    },
    "pages": [
        {
            "key": "booklist",
            "title": "图书管理",
            "columns": [
                {
                    "key": "title",
                    "type": "varchar",
                    "not_null": true,
                    "name": "名称",
                    "setter": "input",
                    "setter_props": {}
                },
                {
                    "key": "author",
                    "type": "varchar",
                    "not_null": false,
                    "name": "作者",
                    "setter": "input",
                    "setter_props": {}
                },
                {
                    "key": "price",
                    "type": "float",
                    "not_null": false,
                    "name": "价格",
                    "setter": "number-input",
                    "setter_props": {}
                }, {
                    "key": "publication_time",
                    "type": "datetime",
                    "not_null": false,
                    "name": "出版时间",
                    "setter": "time-select",
                    "setter_props": {}
                }
            ]
        },
        {
            "key": "borrowlist",
            "title": "借阅管理",
            "columns": [
                {
                    "key": "title",
                    "type": "varchar",
                    "not_null": true,
                    "name": "名称",
                    "setter": "input",
                    "setter_props": {}
                },
                {
                    "key": "author",
                    "type": "varchar",
                    "not_null": false,
                    "name": "作者",
                    "setter": "input",
                    "setter_props": {}
                },
                {
                    "key": "price",
                    "type": "float",
                    "not_null": false,
                    "name": "价格",
                    "setter": "number-input",
                    "setter_props": {}
                }, {
                    "key": "publication_time",
                    "type": "datetime",
                    "not_null": false,
                    "name": "出版时间",
                    "setter": "time-select",
                    "setter_props": {}
                }
            ]
        }
    ]
}