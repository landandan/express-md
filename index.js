const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();

// 解析 application/json 格式的请求体
app.use(express.json());
//  指定静态文件目录，例如 public 文件夹
app.use(express.static("public"));
// app.use(express.static("uploads"));
// app.use(express.static("markdown"));

// 配置 multer 存储引擎
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // 图片存储的目录，需确保该目录存在且有写入权限
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

// 创建 multer 实例
const upload = multer({ storage });

// 处理图片上传的 POST 接口
app.post(
  "/api/uploads/images",
  upload.single("editormd-image-file"),
  (req, res) => {
    console.log("req:", req);
    // 'editormd-image-file' 应与 Editor.md 中设置的文件字段名一致
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    // 返回图片的访问路径
    const filePath = `http://localhost:3000/${file.filename}`;
    res.send({ success: 1, url: filePath });
  }
);

app.post('/api/saveFile/markdown', (req, res) => {
    const { content, title } = req.body;
  
    // 定义保存文档的路径
    const filePath = path.join(__dirname, 'markdown', `${title}.md`);
  
    // 写入文档内容
    fs.writeFile(filePath, content, (err) => {
      if (err) {
        res.status(500).send('Error saving the document');
        return;
      }
      res.send({ success: 1, message: '文档保存成功' });
    });
  });

app.post("/api/readFileList/markdown", async (req, res) => {
  const folderPath = path.join(__dirname, "./markdown"); // 替换为您要读取的文件夹路径

  const files = fs.readdirSync(folderPath);
  // console.log('files:', files)
  res.send({ success: 1, data: files });
  console.log("读取 markdown 文件列表成功");
});

app.post("/api/readFile/markdown", async (req, res) => {
  // console.log("读取 markdown 文件列表:", ctx.request);
  const {  title } = req.body;
  const folderPath = path.join(
    __dirname,
    `./markdown/${title}`
  ); // 替换为您要读取的文件夹路径

  const file = fs.readFileSync(folderPath, "utf-8");
  // console.log('files:', files)
  res.send({ success: 1, data: file });
  console.log(`读取 ${title} 文件成功`);
});

app.listen(3000, () => {
  console.log("服务器运行在 3000 端口");
});
