import Menu from "../models/menu.js";
import joi from "joi"
import handleUpload from "../utils/cloudinary.js";
const formatCreatedAt = (date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
export const createMenu = async (req, res) => {
    try {
        const { name, classify, category, description, price } = req.body;

        const createSchema = joi.object({
            name: joi.string().required().messages({
                'string.empty': 'Tên món ăn không được để trống!'
            }),
            classify: joi.string().required().valid('Món ăn', 'Đồ uống').messages({
                'string.empty': 'Phân loại không được để trống!',
                'any.only': "Loại món ăn trong menu phải là Món ăn hoặc Đồ uống",
            }),
            category: joi.string().required().valid('Bữa sáng', 'Bữa trưa', 'Bữa tối', 'Ngày tết', 'Noel', 'Tình nhân', 'Gia đình', 'Lương về').messages({
                'string.empty': 'Phân loại không được để trống!',
                'any.only': "Loại món ăn trong menu phải là 'Bữa sáng', 'Bữa trưa', 'Bữa tối', 'Ngày tết', 'Noel', 'Tình nhân', 'Gia đình', 'Lương về'",
            }),
            description: joi.string().required().messages({
                'string.empty': 'Mô tả món ăn không được để trống!'
            }),
            price: joi.number().required().messages({
                'any.required': 'Giá món ăn không được để trống!'
            })
        });

        const { error } = createSchema.validate({ name, classify, category, description, price });
        if (error) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin món ăn!" })
        }

        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng tải lên hình ảnh của món ăn!" });
        }

        let unit;
        if (classify === 'Món ăn') {
            unit = 'Phần';
        } else if (classify === 'Đồ uống') {
            unit = 'Cốc';
        } else {
            return res.status(400).json({ message: "Loại món ăn không hợp lệ!" })
        }

        let prefix;
        if (classify === 'Món ăn') {
            prefix = 'A';
        } else if (classify === 'Đồ uống') {
            prefix = 'B';
        } else {
            return res.status(400).json({ message: "Mã món ăn không hợp lệ!" })
        }

        const latestMenu = await Menu.findOne({ code: new RegExp(`^${prefix}`) }).sort({ code: -1 }).exec();
        let newIdMenu;
        if (latestMenu && latestMenu.code) {
            const numericPart = parseInt(latestMenu.code.slice(1)) + 1;
            newIdMenu = `${prefix}${numericPart.toString().padStart(3, '0')}`;
        } else {
            newIdMenu = `${prefix}001`;
        }

        let imageUrl = "";
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const uploadResult = await handleUpload(dataURI);
            imageUrl = uploadResult.url;
        }

        const result = await Menu.create({
            code: newIdMenu,
            name,
            classify,
            category,
            description,
            unit,
            price,
            imageMenu: imageUrl
        });

        return res.status(200).json({
            message: "Thêm mới món ăn vào thực đơn thành công.",
            menu: {
                ...result.toObject(),
                createdAt: formatCreatedAt(result.createdAt)
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export const editMenu = async (req, res) => {
    try {
        const { name, classify, category, description, price, status } = req.body;
        const { id } = req.params;

        const editSchema = joi.object({
            name: joi.string().required().messages({
                'string.empty': 'Tên món ăn không được để trống!'
            }),
            classify: joi.string().required().valid('Món ăn', 'Đồ uống').messages({
                'string.empty': 'Phân loại không được để trống!',
                'any.only': "Loại món ăn trong menu phải là 'Món ăn' hoặc 'Đồ uống'",
            }),
            category: joi.string().required().valid('Bữa sáng', 'Bữa trưa', 'Bữa tối', 'Ngày tết', 'Noel', 'Tình nhân', 'Gia đình', 'Lương về').messages({
                'string.empty': 'Phân loại không được để trống!',
                'any.only': "Loại món ăn trong menu phải là 'Bữa sáng', 'Bữa trưa', 'Bữa tối', 'Ngày tết', 'Noel', 'Tình nhân', 'Gia đình', 'Lương về'",
            }),
            description: joi.string().required().messages({
                'string.empty': 'Mô tả món ăn không được để trống!'
            }),
            price: joi.number().required().messages({
                'any.required': 'Giá món ăn không được để trống!'
            }),
            status: joi.string().required().valid('Còn món', 'Hết món').messages({
                'string.empty': 'Trạng thái món ăn không được để trống!',
                'any.only': "Trạng thái món ăn trong menu phải là 'Còn món' hoặc 'Hết món'",
            }),
        });

        const { error } = editSchema.validate({ name, classify, category, description, price, status });
        if (error) {
            return res.status(400).json({ message: error.message })
        }

        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng tải lên hình ảnh của món ăn!" });
        }

        let unit;
        if (classify === 'Món ăn') {
            unit = 'Phần';
        } else if (classify === 'Đồ uống') {
            unit = 'Cốc';
        }

        const updateMenu = await Menu.findById(id);
        if (!updateMenu) {
            return res.status(404).json({ message: "Món ăn không tồn tại!" });
        }

        let prefix;
        if (classify === 'Món ăn') {
            prefix = 'A';
        } else if (classify === 'Đồ uống') {
            prefix = 'B';
        }

        let newIdMenu = updateMenu.code;
        if ((classify === 'Món ăn' && !updateMenu.code.startsWith('A')) ||
            (classify === 'Đồ uống' && !updateMenu.code.startsWith('B'))) {
            const latestMenu = await Menu.findOne({ code: new RegExp(`^${prefix}`) }).sort({ code: -1 }).exec();
            if (latestMenu && latestMenu.code) {
                const numericPart = parseInt(latestMenu.code.slice(1)) + 1;
                newIdMenu = `${prefix}${numericPart.toString().padStart(3, '0')}`;
            } else {
                newIdMenu = `${prefix}001`;
            }
        }

        updateMenu.code = newIdMenu;
        updateMenu.name = name;
        updateMenu.classify = classify;
        updateMenu.category = category;
        updateMenu.description = description;
        updateMenu.unit = unit;
        updateMenu.price = price;
        updateMenu.status = status;

        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const uploadResult = await handleUpload(dataURI);
            updateMenu.imageMenu = uploadResult.url;
        }

        await updateMenu.save();

        return res.status(200).json({
            message: "Cập nhật món ăn trong thực đơn thành công.",
            menu: {
                ...updateMenu.toObject(),
                createdAt: formatCreatedAt(updateMenu.createdAt)
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
export const deleteMenu = async (req, res) => {
    try {
        const id = req.params.id;
        const menu = await Menu.findByIdAndDelete(id)

        if (!menu) {
            return res.status(400).json({ message: "Không tìm thấy món ăn cần tìm!" })
        }

        return res.status(200).json({ message: "Xóa món ăn ra khỏi menu thành công!" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export const getPagingMenu = async (req, res) => {
    try {
        const query = req.query
        const menus = await Menu.find()
            .skip(query.pageSize * query.pageIndex - query.pageSize)
            .limit(query.pageSize).sort({ createdAt: "desc" })

        const countMenus = await Menu.countDocuments()
        const totalPage = Math.ceil(countMenus / query.pageSize)

        const formattedMenus = menus.map(menu => ({
            ...menu.toObject(),
            createdAt: formatCreatedAt(menu.createdAt)
        }));

        return res.status(200).json({ menus: formattedMenus, totalPage, count: countMenus })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export const getMenuById = async (req, res) => {
    try {
        const { id } = req.params;
        const menu = await Menu.findById(id)
        if (!menu) {
            return res.status(400).json({ message: "Không tìm thấy món ăn cần tìm!" })
        }
        return res.status(200).json({ menu })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
export const searchMenu = async (req, res) => {
    try {
        const { keyword, option } = req.body
        if (!keyword || !option) {
            const noKeyword = await Menu.find()
            return res.status(400).json({ noKeyword })
        }

        let searchField = {};
        if (option === "code") {
            searchField = { code: { $regex: keyword, $options: 'i' } };
        } else if (option === "name") {
            searchField = { name: { $regex: keyword, $options: 'i' } };
        } else {
            return res.status(400).json({ message: "Tùy chọn tìm kiếm không hợp lệ!" })
        }

        const menus = await Menu.find({ ...searchField });

        if (!menus || menus.length === 0) {
            return res.status(400).json({ message: "Không tìm thấy món ăn cần tìm!" })
        }

        const formattedMenus = menus.map(menu => ({
            ...menu.toObject(),
            createdAt: formatCreatedAt(menu.createdAt)
        }));

        return res.status(200).json({ menus: formattedMenus });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
};

export const getMenuByCategory = async (req, res) => {
    try {
        const { category } = req.body;
        const menu = await Menu.findOne({ category });
        if (!menu) {
            return res.status(404).json({ message: "Không tìm thấy món ăn!" });
        }
        return res.status(200).json({ menu });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getAll = async (req, res) => {
    try {
        const { category } = req.query; // Lấy category từ tham số query
        let query = {};

        // Nếu category được cung cấp, thêm nó vào query
        if (category) {
            query.category = category;
        }
        const menuslist = await Menu.find().sort({ createdAt: "desc" });
        
        if (!menuslist || menuslist.length === 0) {
            return res.status(404).json({ message: "Không có món ăn nào được tìm thấy!" });
        }

        return res.status(200).json({ menuslist });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// export const uploadImageMenu = async (req, res) => {
//     try {
//         const b64 = Buffer.from(req.file.buffer).toString("base64");
//         let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
//         const result = await handleUpload(dataURI)
//         const imageMenuId = req.body.imageMenuId
//         const updateImageMenu = await Menu.findByIdAndUpdate(imageMenuId, {imageMenu: result.url})
//         return res.status(200).json({url:result.url})
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json(error);
//     }
// }