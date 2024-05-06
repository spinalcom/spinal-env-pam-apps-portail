import {
  expect,
  jest,
  test,
  describe,
  it,
  beforeAll,
  afterAll,
} from "@jest/globals";
import { GroupWithChildren } from "..";
import { EGroupType, type IGroupItem } from "../Interfaces";

let grpWithChildren: GroupWithChildren<IGroupItem> =
  new GroupWithChildren<IGroupItem>();
let treeTmp: IGroupItem[] = [];
const contextes: Array<{ title: string; newTitle: string; id: number }> = [
  { title: "grpCTx1", newTitle: "newCtx1", id: -1 },
  { title: "grpCTx2", newTitle: "newCtx2", id: -1 },
  { title: "grpCTx3", newTitle: "newCtx3", id: -1 },
];
const categories: Array<{ title: string; newTitle: string; id: number }> = [
  { title: "grpCtx1Category1", newTitle: "newGrpCtx1Category1", id: -1 },
  { title: "grpCTx1Category2", newTitle: "newGrpCtx1Category2", id: -1 },
  { title: "grpCTx2Category1", newTitle: "newGrpCtx2Category1", id: -1 },
];
const groups: Array<{ title: string; newTitle: string; id: number }> = [
  {
    title: "grpCtx1Category1Grp1",
    newTitle: "newGrpCtx1Category1Grp1",
    id: -1,
  },
  {
    title: "grpCtx1Category2Grp1",
    newTitle: "newGrpCtx1Category2Grp1",
    id: -1,
  },
  {
    title: "grpCtx2Category1Grp1",
    newTitle: "newGrpCtx2Category1Grp1",
    id: -1,
  },
];

beforeAll(async () => {
  grpWithChildren = new GroupWithChildren();
});

describe("[BASIC] - [GroupWithChildren] => [Functionality]", () => {
  it("The tree should be empty", async () => {
    expect(grpWithChildren.getTree().length).toBe(0);
  });
});

describe("[BASIC] - [GroupWithChildren] => [Functionality - ADD]", () => {
  it("The tree should contain 3 context group", () => {
    let treeTmp: IGroupItem[] = [];
    const pms: Array<Promise<IGroupItem>> = [];

    pms.push(
      grpWithChildren.addNewItem({
        title: contextes.at(0)?.title,
        type: EGroupType.GRP_CONTEXT,
      } as IGroupItem)
    );
    pms.push(
      grpWithChildren.addNewItem({
        title: contextes.at(1)?.title,
        type: EGroupType.GRP_CONTEXT,
      } as IGroupItem)
    );
    pms.push(
      grpWithChildren.addNewItem({
        title: contextes.at(2)?.title,
        type: EGroupType.GRP_CONTEXT,
      } as IGroupItem)
    );
    Promise.all(pms)
      .then((objs) => {
        contextes[0].id = objs[0].id;
        contextes[1].id = objs[1].id;
        contextes[2].id = objs[2].id;
      })
      .then(() => {
        treeTmp = grpWithChildren.getTree();
        expect(treeTmp.length).toEqual(3);
        expect(treeTmp).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: contextes.at(0)?.id,
              title: contextes.at(0)?.title,
              type: EGroupType.GRP_CONTEXT,
              children: [],
            }),
            expect.objectContaining({
              id: contextes.at(1)?.id,
              title: contextes.at(1)?.title,
              type: EGroupType.GRP_CONTEXT,
              children: [],
            }),
            expect.objectContaining({
              id: contextes.at(2)?.id,
              title: contextes.at(2)?.title,
              type: EGroupType.GRP_CONTEXT,
              children: [],
            }),
          ])
        );
      })
      .catch((e: any) => {
        console.error(e);
        expect(-1).toEqual(2);
      });
  });

  it("The tree should contain 3 context group and 3 category group", () => {
    const pms: Array<Promise<IGroupItem>> = [];
    const titles: string[] = [
      "grpCtx1Category1",
      "grpCTx1Category2",
      "grpCTx2Category1",
    ];

    pms.push(
      grpWithChildren.addNewItem(
        {
          title: categories.at(0)?.title,
          type: EGroupType.GRP_CATEGORY,
        } as IGroupItem,
        grpWithChildren.getTree().at(0)
      )
    );
    pms.push(
      grpWithChildren.addNewItem(
        {
          title: categories.at(1)?.title,
          type: EGroupType.GRP_CATEGORY,
        } as IGroupItem,
        grpWithChildren.getTree().at(0)
      )
    );
    pms.push(
      grpWithChildren.addNewItem(
        {
          title: categories.at(2)?.title,
          type: EGroupType.GRP_CATEGORY,
        } as IGroupItem,
        grpWithChildren.getTree().at(1)
      )
    );
    Promise.all(pms)
      .then((objs) => {
        categories[0].id = objs[0].id;
        categories[1].id = objs[1].id;
        categories[2].id = objs[2].id;
      })
      .then(() => {
        treeTmp = grpWithChildren.getTree();
        expect(treeTmp).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: contextes.at(0)?.id,
              title: contextes.at(0)?.title,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  id: categories.at(0)?.id,
                  title: categories.at(0)?.title,
                  type: EGroupType.GRP_CATEGORY,
                  children: [],
                }),
                expect.objectContaining({
                  id: categories.at(1)?.id,
                  title: categories.at(1)?.title,
                  type: EGroupType.GRP_CATEGORY,
                  children: [],
                }),
              ]),
            }),
            expect.objectContaining({
              title: contextes.at(1)?.title,
              id: contextes.at(1)?.id,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  id: categories.at(2)?.id,
                  title: categories.at(2)?.title,
                  type: EGroupType.GRP_CATEGORY,
                  children: [],
                }),
              ]),
            }),
            expect.objectContaining({
              id: contextes.at(2)?.id,
              title: contextes.at(2)?.title,
              type: EGroupType.GRP_CONTEXT,
              children: [],
            }),
          ])
        );
      })
      .catch((e: any) => {
        console.error(e);
        expect(-89).toEqual(2);
      });
  });

  it("The tree should contain 3 context group, 3 category group and 3 group group", () => {
    const pms: Array<Promise<IGroupItem>> = [];

    pms.push(
      grpWithChildren.addNewItem(
        {
          title: groups.at(0)?.title,
          type: EGroupType.GRP_GROUP,
        } as IGroupItem,
        grpWithChildren.getTree().at(0)?.children.at(0)
      )
    );
    pms.push(
      grpWithChildren.addNewItem(
        {
          title: groups.at(1)?.title,
          type: EGroupType.GRP_GROUP,
        } as IGroupItem,
        grpWithChildren.getTree().at(0)?.children.at(1)
      )
    );
    pms.push(
      grpWithChildren.addNewItem(
        {
          title: groups.at(2)?.title,
          type: EGroupType.GRP_GROUP,
        } as IGroupItem,
        grpWithChildren.getTree().at(1)?.children.at(0)
      )
    );
    Promise.all(pms)
      .then((objs) => {
        groups[0].id = objs[0].id;
        groups[1].id = objs[1].id;
        groups[2].id = objs[2].id;
      })
      .then(() => {
        treeTmp = grpWithChildren.getTree();
        expect(treeTmp).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: contextes.at(0)?.title,
              id: contextes.at(0)?.id,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  title: categories.at(0)?.title,
                  id: categories.at(0)?.id,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      title: groups.at(0)?.title,
                      id: groups.at(0)?.id,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                    }),
                  ]),
                }),
                expect.objectContaining({
                  id: categories.at(1)?.id,
                  title: categories.at(1)?.title,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      id: groups.at(1)?.id,
                      title: groups.at(1)?.title,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                    }),
                  ]),
                }),
              ]),
            }),
            expect.objectContaining({
              id: contextes.at(2)?.id,
              title: contextes.at(1)?.title,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  id: categories.at(2)?.id,
                  title: categories.at(2)?.title,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      id: groups.at(2)?.id,
                      title: groups.at(2)?.title,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                    }),
                  ]),
                }),
              ]),
            }),
            expect.objectContaining({
              id: contextes.at(2)?.id,
              title: contextes.at(2)?.title,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([]),
            }),
          ])
        );
      })
      .catch((e: any) => {
        console.error(e);
        expect(-89).toEqual(2);
      });
  });
});

describe("[BASIC] - [GroupWithChildren] => [Functionality - UPDATE]", () => {
  it("Should update two context group", () => {
    const infoUpdates: IGroupItem[] = [
      { title: contextes.at(0)?.newTitle, type: EGroupType.GRP_CONTEXT },
      { title: contextes.at(1)?.newTitle, type: EGroupType.GRP_CONTEXT },
      { title: contextes.at(2)?.newTitle, type: EGroupType.GRP_CONTEXT },
    ];
    const tree: IGroupItem[] = grpWithChildren.getTree();

    const pms: Array<Promise<IGroupItem>> = [];
    pms.push(grpWithChildren.editItem(infoUpdates.at(0), tree.at(0)));
    pms.push(grpWithChildren.editItem(infoUpdates.at(1), tree.at(1)));

    Promise.all(pms)
      .then(() => {
        treeTmp = grpWithChildren.getTree();
        expect(treeTmp).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: contextes.at(0)?.newTitle,
              type: EGroupType.GRP_CONTEXT,
            }),
            expect.objectContaining({
              title: contextes.at(1)?.newTitle,
              type: EGroupType.GRP_CONTEXT,
            }),
            expect.objectContaining({
              title: contextes.at(2)?.title,
              type: EGroupType.GRP_CONTEXT,
            }),
          ])
        );
      })
      .catch((e: any) => {
        console.error(e);
        expect(-89).toEqual(2);
      });
  });

  it("Should update two category group", () => {
    const infoUpdates: IGroupItem[] = [
      { title: categories.at(0)?.newTitle, type: EGroupType.GRP_CATEGORY },
      { title: categories.at(1)?.newTitle, type: EGroupType.GRP_CATEGORY },
      { title: categories.at(2)?.newTitle, type: EGroupType.GRP_CATEGORY },
    ];
    const tree: IGroupItem[] = grpWithChildren.getTree();

    const pms: Array<Promise<IGroupItem>> = [];
    pms.push(
      grpWithChildren.editItem(infoUpdates.at(0)!, tree.at(0)!.children.at(0)!)
    );
    pms.push(
      grpWithChildren.editItem(infoUpdates.at(1)!, tree.at(1)!.children.at(0)!)
    );

    Promise.all(pms)
      .then(() => {
        treeTmp = grpWithChildren.getTree();
        expect(treeTmp).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: contextes.at(0)?.newTitle,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  title: categories.at(0)?.newTitle,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.any(Array),
                }),
              ]),
            }),
            expect.objectContaining({
              title: contextes.at(1)?.newTitle,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  title: categories.at(1)?.newTitle,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.any(Array),
                }),
              ]),
            }),
            expect.objectContaining({
              title: contextes.at(2)?.title,
              type: EGroupType.GRP_CONTEXT,
              children: [],
            }),
          ])
        );
      })
      .catch((e: any) => {
        console.error(e);
        expect(-99).toEqual(2);
      });
  });

  it("Should update three group group", () => {
    const infoUpdates: IGroupItem[] = [
      { title: groups.at(0)?.newTitle, type: EGroupType.GRP_GROUP },
      { title: groups.at(1)?.newTitle, type: EGroupType.GRP_GROUP },
      { title: groups.at(2)?.newTitle, type: EGroupType.GRP_GROUP },
    ];
    const tree: IGroupItem[] = grpWithChildren.getTree();

    const pms: Array<Promise<IGroupItem>> = [];
    pms.push(
      grpWithChildren.editItem(
        infoUpdates.at(0)!,
        tree.at(0)!.children.at(0)!.children.at(0)!
      )
    );
    pms.push(
      grpWithChildren.editItem(
        infoUpdates.at(1)!,
        tree.at(1)!.children.at(0)!.children.at(0)!
      )
    );
    pms.push(
      grpWithChildren.editItem(
        infoUpdates.at(2)!,
        tree.at(0)!.children.at(1)!.children.at(0)!
      )
    );

    Promise.all(pms)
      .then(() => {
        treeTmp = grpWithChildren.getTree();
        expect(treeTmp).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: contextes.at(0)?.newTitle,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  title: categories.at(0)?.newTitle,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      title: groups.at(0)?.newTitle,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                    }),
                  ]),
                }),
                expect.objectContaining({
                  title: categories.at(1)?.title,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      title: groups.at(2)?.newTitle,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                    }),
                  ]),
                }),
              ]),
            }),
            expect.objectContaining({
              title: contextes.at(1)?.newTitle,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  title: categories.at(1)?.newTitle,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      title: groups.at(1)?.newTitle,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                    }),
                  ]),
                }),
              ]),
            }),
            expect.objectContaining({
              title: contextes.at(2)?.title,
              type: EGroupType.GRP_CONTEXT,
              children: [],
            }),
          ])
        );
      })
      .catch((e: any) => {
        console.error(e);
        expect(-109).toEqual(2);
      });
  });
});

describe("[BASIC] - [GroupWithChildren] => [Functionality - DELETE]", () => {
  it("Should delete a group group", async () => {
    const pms: Array<Promise<IGroupItem>> = [];
    const treeTmp: IGroupItem[] = grpWithChildren.getTree();

    pms.push(
      grpWithChildren.deleteItem(treeTmp.at(0)!.children.at(0)!.children.at(0)!)
    );

    Promise.all(pms)
      .then(() => {
        expect(treeTmp).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: contextes.at(0)?.newTitle,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  title: categories.at(0)?.newTitle,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      title: groups.at(0)?.newTitle,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                      operation: "delete",
                    }),
                  ]),
                }),
                expect.objectContaining({
                  title: categories.at(1)?.title,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      title: groups.at(2)?.newTitle,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                    }),
                  ]),
                }),
              ]),
            }),
            expect.objectContaining({
              title: contextes.at(1)?.newTitle,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  title: categories.at(1)?.newTitle,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      title: groups.at(1)?.newTitle,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                    }),
                  ]),
                }),
              ]),
            }),
            expect.objectContaining({
              title: contextes.at(2)?.title,
              type: EGroupType.GRP_CONTEXT,
              children: [],
            }),
          ])
        );
      })
      .catch((e: any) => {
        console.error(e);
        expect(-34).toEqual(2);
      });
  });

  it("Should delete a category group", () => {
    const pms: Array<Promise<IGroupItem>> = [];
    let treeTmp: IGroupItem[] = grpWithChildren.getTree();

    pms.push(grpWithChildren.deleteItem(treeTmp.at(0)!.children.at(1)!));

    Promise.all(pms)
      .then(() => {
        treeTmp = grpWithChildren.getTree();
        expect(treeTmp).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: contextes.at(0)?.newTitle,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  title: categories.at(0)?.newTitle,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      title: groups.at(0)?.newTitle,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                      operation: "delete",
                    }),
                  ]),
                }),
                expect.objectContaining({
                  title: categories.at(1)?.title,
                  type: EGroupType.GRP_CATEGORY,
                  display: false,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      title: groups.at(2)?.newTitle,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                    }),
                  ]),
                }),
              ]),
            }),
            expect.objectContaining({
              title: contextes.at(1)?.newTitle,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  title: categories.at(1)?.newTitle,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      title: groups.at(1)?.newTitle,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                    }),
                  ]),
                }),
              ]),
            }),
            expect.objectContaining({
              title: contextes.at(2)?.title,
              type: EGroupType.GRP_CONTEXT,
              children: [],
            }),
          ])
        );
      })
      .catch((e: any) => {
        console.error(e);
        expect(-44).toEqual(2);
      });
  });

  it("Should delete a context group", () => {
    const pms: Array<Promise<IGroupItem>> = [];
    let treeTmp: IGroupItem[] = grpWithChildren.getTree();

    pms.push(grpWithChildren.deleteItem(treeTmp.at(2)!));

    Promise.all(pms)
      .then(() => {
        treeTmp = grpWithChildren.getTree();
        expect(treeTmp).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: contextes.at(0)?.newTitle,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  title: categories.at(0)?.newTitle,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      title: groups.at(0)?.newTitle,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                    }),
                  ]),
                }),
                expect.objectContaining({
                  title: categories.at(1)?.title,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      title: groups.at(2)?.newTitle,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                    }),
                  ]),
                }),
              ]),
            }),
            expect.objectContaining({
              title: contextes.at(1)?.newTitle,
              type: EGroupType.GRP_CONTEXT,
              children: expect.arrayContaining([
                expect.objectContaining({
                  title: categories.at(1)?.newTitle,
                  type: EGroupType.GRP_CATEGORY,
                  children: expect.arrayContaining([
                    expect.objectContaining({
                      title: groups.at(1)?.newTitle,
                      type: EGroupType.GRP_GROUP,
                      children: [],
                    }),
                  ]),
                }),
              ]),
            }),
            expect.objectContaining({
              title: contextes.at(2)?.title,
              type: EGroupType.GRP_CONTEXT,
              children: [],
              operation: "delete",
            }),
          ])
        );
      })
      .catch((e: any) => {
        console.error(e);
        expect(-54).toEqual(2);
      });
  });
});

afterAll(() => {
  const pms: Array<Promise<IGroupItem>> = [];

  treeTmp = grpWithChildren.getTree();
  treeTmp.forEach((itemCtx: IGroupItem) => {
    if (itemCtx.display) {
      pms.push(grpWithChildren.deleteItem(itemCtx));
    }
  });
  Promise.all(pms)
    .then(() => {
      treeTmp = grpWithChildren.getTree();
      expect(treeTmp.filter((el: IGroupItem) => el.display).length).toEqual(0);
    })
    .catch((e: any) => {
      expect(-76).toEqual(2);
    });
});
