const tree = {
  data: {
    w: 20,
    h: 20,
    x: 0,
    y: 0,
  },
  children: [{
    data: {
      w: 50,
      h: 50,
    },
    children: [{
      data: {
        w: 30,
        h: 10,
      },
      children: []
    }, {
      data: {
        w: 10,
        h: 50,
      },
      children: []
    }, {
      data: {
        w: 10,
        h: 50,
      },
      children: []
    }, ]
  }]
}

function layout(treeData) {
  if(treeData.children && treeData.children.length) {
    treeData.children.forEach(item => {
      layout(item);
      layoutChildren(treeData);
      layoutParent(treeData);
    })
  } else {
    layoutParent(treeData);
  }
  return treeData;
}

console.log(JSON.stringify(layout(tree)));

/**
 * 横向布局
 * children 节点整体布局
 * 求最大宽度，
 * 最大高度，假设间隔为 20 
 */
function layoutChildren(treeData){
  treeData.data.childW = getMaxChildrenW(treeData.children)
  treeData.data.childH = getAccChildHeight(treeData.children);
}

/**
 * 横向布局
 * parentW = children 整体的 parentW + 自身的 w;
 * parentH = Math.max(children 整体的 H, 自身的 h);
 */
function layoutParent(treeData) {
  treeData.data.parentW = getChildParentW(treeData);
  treeData.data.parentH = getChildMaxParentH(treeData);
}

/**
 * 求自身节点以及 children 所组成的整体宽度
 */
function getChildParentW(treeData) {
  let maxWidth = treeData.children.reduce((acc, item) => {
    if(acc < item.data.parentW) {
      acc = item.data.parentW;
    }
    return acc;
  }, 0)
  return maxWidth + treeData.data.w;
}


/**
 * 求自身节点以及 children 所组成的整体高度
 */
function getChildMaxParentH(treeData) {
  const maxHeight = treeData.children.reduce((acc, item) => {
    return acc += (item.data.parentH  || 0);
  }, 0)
  return Math.max(maxHeight, treeData.data.h);
}

/**
 * 求 children 节点最大的宽度
 */
function getMaxChildrenW(arr) {
  return arr.reduce((acc, curr) => {
    if(acc < curr.data.parentW) {
      acc = curr.data.parentW
    }
    return acc;
  },0)
}

/**
 * 求 children 节点整体的高度
 */
function getAccChildHeight(arr) {
  return arr.reduce((acc, curr) => {
    acc += curr.data.parentH;
    return acc;
  }, 0)
}
