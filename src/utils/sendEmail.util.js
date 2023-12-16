require("dotenv").config();
const nodemailer = require("nodemailer");
const err = require("../errors/index");
const { v4: uuidv4 } = require("uuid");

const smtpTrans = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

smtpTrans.verify(function (error, success) {
  if (error) {
  } else {
    console.log("Nodemailer connection: OK, user: " + process.env.EMAIL_USER);
    console.log("============================================================");
  }
});
const getEmailTemplate = (url, textButton, content) => {
  return `
  <html>
    <head>
      <style>
        .container {
            background-color: azure; 
            padding: 30px 300px; 
          }
        .content {
            background-color: #FFFFFF; 
            padding: 10px 30px; 
            border-radius: 10px;
          }
        .top {
            padding: 20px 0 30px;
        }
        .top-image {
            width: 80px; 
            height: 70px;
            display: block;
            margin: 0 auto;
        }
        .top-title {
            font-size: 25px; 
            font-weight: bold;
            margin-top: 10px;
            text-align: center;
        }
        .divider {
            height: 2px; 
            background-color: aliceblue;
        }
        .notification {
            font-weight: bold; 
            font-size: 20px;
        }
        .button {
            background-color: #EA4C89; 
            border-radius: 8px; 
            border-style: none; 
            box-sizing: border-box; 
            color: #FFFFFF; 
            cursor: pointer; 
            display: inline-block; 
            font-size: 14px; 
            font-weight: 500; 
            height: 40px; 
            line-height: 20px; 
            list-style: none; 
            margin: 0; 
            outline: none; 
            padding: 10px 16px; 
            text-align: center; 
            text-decoration: none;
        }
        @media screen and (min-width: 320px) and (max-width: 768px) {
          .container {
            background-color: azure; 
            padding: 30px 10px; 
          }
          .content {
            padding: 10px 10px; 
          }
          .top-title {
            font-size: 20px;
          }
          .notification {
            font-size: 18px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <div class="top">
            <img src="https://res.cloudinary.com/polarbearhust/image/upload/v1690364602/equipment/r8fnbjzk8rzmiuwgkx6k.png" alt="mdm-ibme" class="top-image"/>
            <div class="top-title">Bệnh viện iBME</div>
          </div>
          <div class="divider"></div>
          <p style="font-size: 20px; font-weight: bold;">Chào bạn,</p>
          <p>Hệ thống quản lý trang thiết bị y tế của bệnh viện iBME xin gửi tới bạn thông báo sau:
          ${content}
          <p>Vui lòng click vào đường link bên dưới để xem thông tin chi tiết:</p>
          <div style="display: flex; justify-content: center; margin: 30px 0;">
            <p class="button">
              <a style="color: white; text-decoration: none;" href=${url} target="_blank">${textButton}</a>
            </p>
          </div>
          <div style="color: red; font-style: italic;">Lưu ý: Đây là email tự động, vui lòng không phản hồi lại!</div>
          <p>Nếu gặp khó khăn trong quá trình sử dụng hệ thống, hãy liên hệ với <a style="color: blue; text-decoration: none;" href=${process.env.FACEBOOK_URL} target="_blank">đội ngũ trợ giúp của chúng tôi!</a></p>
        </div>
      </div>
    </body>
  </html>
  `;
};

module.exports.sendActiveEmail = async (req, user) => {
  const activeToken = uuidv4();
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/active/${activeToken}`;
  const content = `
    <p class="notification">Bạn nhận được email này vì bạn đã đăng kí tài khoản trên hệ thống.</p>
    <p class="notification">Click vào đường link bên dưới, hoặc copy và dán váo trình duyệt mà bạn sử dụng để hoàn tất quá trình kích hoạt tài khoản</p>
  `;
  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    to: user.email,
    subject: "Kích hoạt tài khoản",
    html: getEmailTemplate(url, "Kích hoạt tài khoản", content),
  };

  const send = await smtpTrans.sendMail(mailOptions);
  if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  return activeToken;
};

module.exports.sendForgotEmail = async (req, user) => {
  const token = uuidv4();
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/reset_password/${token}`;
  const content = `
    <p class="notification">Bạn nhận được email này vì hệ thống nhận được yêu cầu thay đổi mật khẩu từ tài khoản của bạn.</p>
    <p class="notification">Click vào đường link bên dưới để hoàn tất quá trình thay đổi mật khẩu của bạn</p>
    <p class="notification">Nếu yêu cầu này không phải của bạn, hãy bỏ qua email này và mật khẩu của bạn sẽ không thay đổi</p>
  `;

  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    to: user.email,
    subject: "Thay đổi mật khẩu",
    html: getEmailTemplate(url, "Thay đổi mật khẩu", content),
  };

  const send = await smtpTrans.sendMail(mailOptions);

  if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  return token;
};

module.exports.sendEmailUpdatePermission = async (users) => {
  const url = process.env.URL_REACT;
  const content = `
    <p class="notification">Hệ thống vừa cập nhật quyền sử dụng phần mềm đối với tài khoản của bạn.</p>
    <p class="notification">Đăng xuất tài khoản để cập nhật đầy đủ quyền sử dụng và các tính năng mới nhất của phần mềm.</p>
  `;
  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: "Cập nhật quyền sử dụng",
    html: getEmailTemplate(url, "Chi tiết cập nhật", content),
  };

  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};

module.exports.sendReportEquipmentMail = async (req, users, data) => {
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/equipment/repair/broken_report/${data?.equipment_id}/${data?.id}`;
  const content = `
    <p class="notification">Phiếu báo hỏng thiết bị ${data?.name} thuộc ${
    data?.department
  } đã được ${data.isEdit === 0 ? "tạo mới" : "cập nhật"}.</p>
  `;
  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: `${
      data.isEdit === 0
        ? "Báo hỏng thiết bị"
        : "Cập nhật phiếu báo hỏng thiết bị"
    }`,
    html: getEmailTemplate(url, "Thông tin phiếu báo hỏng", content),
  };

  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};

module.exports.sendHandleReportEquipmentEmail = async (req, data, users) => {
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/equipment/repair/broken_report/${data?.equipment_id}/${data?.id}`;
  let content;
  if (data.report_status === 1) {
    content = `
      <p class="notification">Phiếu báo hỏng của Thiết bị ${data?.name} thuộc ${data?.department} đã được phê duyệt.</p>
      <p class="notification">Đại diện phòng Vật tư sẽ lập phiếu sửa chữa và tiến hành sửa chữa thiết bị theo kế hoạch.</p>
  `;
  } else {
    content = `
      <p class="notification">Phiếu báo hỏng của Thiết bị ${data?.name} thuộc ${data?.department} đã bị từ chối.</p>
      <p class="notification">Lí do: ${data?.report_note}.</p>
      <p class="notification">Hãy kiểm tra lại phiếu báo hỏng của thiết bị.</p>
    `;
  }

  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: `${
      data.report_status === 1 ? "Phê duyệt" : "Từ chối phê duyệt"
    } phiếu báo hỏng thiết bị`,
    html: getEmailTemplate(url, "Thông tin phiếu báo hỏng", content),
  };

  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};

module.exports.sendScheduleRepairEmail = async (req, data, users) => {
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/equipment/repair/update_schedule/${data?.equipment_id}/${data?.id}`;
  const content = `
    <p class="notification">Phiếu sửa chữa thiết bị ${data.name} thuộc ${
    data?.department
  } đã được ${data.isEdit === 0 ? "tạo mới" : "cập nhật"}.</p>
    <p class="notification">Hãy kiểm tra chi tiết thông tin của phiếu sửa chữa và phản hồi lại trên hệ thống.</p>
  `;
  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: `${
      data.isEdit === 0
        ? "Sửa chữa thiết bị"
        : "Cập nhật phiếu sửa chữa thiết bị"
    }`,
    html: getEmailTemplate(url, "Phiếu sửa chữa thiết bị", content),
  };

  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};

module.exports.sendHandleScheduleRepairEmail = async (req, data, users) => {
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/equipment/repair/update_schedule/${data?.equipment_id}/${data?.id}`;
  let content;
  if (data.schedule_repair_status === 1) {
    content = `
      <p class="notification">Phiếu sửa chữa của thiết bị ${data?.name} thuộc khoa phòng ${data?.department} đã được phê duyệt.</p>
      <p class="notification">Đại diện phòng vật tư sẽ liên hệ với đơn vị sửa chữa.</p>
      <p class="notification">Qui trình sửa chữa thiết bị sẽ diễn ra theo đúng kế hoạch trong phiếu sửa chữa.</p>
  `;
  } else {
    content = `
      <p class="notification">Phiếu sửa chữa của thiết bị ${data?.name} thuộc ${data?.department} đã bị từ chối.</p>
      <p class="notification">Lí do: ${data?.schedule_repair_note}.</p>
      <p class="notification">Hãy kiểm tra lại phiếu sửa chữa của thiết bị.</p>
    `;
  }

  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: `${
      data.schedule_repair_status === 1 ? "Phê duyệt" : "Từ chối phê duyệt"
    } phiếu sửa chữa thiết bị`,
    html: getEmailTemplate(url, "Phiếu sửa chữa thiết bị", content),
  };

  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};

module.exports.sendAcceptanceRepairEmail = async (req, data, users) => {
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const status_equipment =
    data.repair_status == 3
      ? "Hoạt động bình thường"
      : "Sửa chữa thất bại, chuyển trạng thái ngừng sử dụng";
  const url = `${domain}/equipment/repair/update_schedule/${data?.equipment_id}/${data?.id}`;
  const content = `
    <p class="notification">Phiếu sửa chữa của thiết bị ${data?.name} thuộc khoa phòng ${data?.department} đã được nghiệm thu.</p>
    <p class="notification">Trạng thái thiết bị: ${status_equipment}.</p>
    <p class="notification">Thiết bị sẽ được bàn giao lại khoa phòng quản lý.</p>
  `;
  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: "Nghiệm thu phiếu sửa chữa thiết bị",
    html: getEmailTemplate(url, "Phiếu sửa chữa thiết bị", content),
  };

  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};

module.exports.reHandoverEmail = async (req, users, data) => {
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/equipment/repair/update_schedule/${data?.equipment_id}/${data?.id}`;
  const content = `
    <p class="notification">Thiết bị ${data?.equipment_name} thuộc ${data?.department_name} đã được bàn giao sau khi hoàn tất quá trình sửa chữa.</p>
    <p class="notification">Các tài liệu trong quá trình báo hỏng và sửa chữa của thiết bị đã được gửi đính kèm. </p>
  `;
  let attachments = [];
  if (data?.brokenFile) {
    attachments.push({
      filename: "Phiếu báo hỏng.docx",
      content: data?.brokenFile?.split("base64,")[1],
      encoding: "base64",
    });
  }
  if (data?.repairFile) {
    attachments.push({
      filename: "Phiếu yêu cầu sửa chữa.docx",
      content: data?.repairFile?.split("base64,")[1],
      encoding: "base64",
    });
  }
  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: "Bàn giao thiết bị",
    html: getEmailTemplate(url, "Phiếu sửa chữa thiết bị", content),
    attachments,
  };
  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};

module.exports.sendLiquidationRequestEmail = async (req, data, users) => {
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/equipment/liquidation/detail/${data?.equipment_id}/${data.id}`;
  const content = `
    <p class="notification">Phiếu thanh lý thiết bị ${data?.name} thuộc ${
    data?.department
  } đã được ${data.isEdit === 0 ? "tạo mới" : "cập nhật"}.</p>
    ${
      data.isEdit === 0 &&
      `<p class="notification">Lí do thanh lý: ${data.reason}</p>`
    }
  `;
  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: `${
      data.isEdit === 0
        ? "Thanh lý thiết bị"
        : "Cập nhật phiếu thanh lý thiết bị"
    }`,
    html: getEmailTemplate(url, "Phiếu thanh lý thiết bị", content),
  };

  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};

module.exports.sendLiquidationDoneEmail = async (req, data, users) => {
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/equipment/liquidation/detail/${data?.equipment_id}/${data.id}`;
  let content;
  if (data.liquidation_status === 1) {
    content = `
      <p class="notification">Phiếu thanh lý thiết bị ${data?.name} thuộc ${data?.department} đã được phê duyệt.</p>
      <p class="notification">Thiết bị sẽ được chuyển vào kho thanh lý trong vài ngày tới.</p>
      <p class="notification">Khoa phòng quản lý cần vệ sinh và khử khuẩn thiết bị.</p>
    `;
  } else {
    content = `
      <p class="notification">Phiếu thanh lý thiết bị ${data?.name} thuộc ${data?.department} đã bị từ chối.</p>
      <p class="notification">Lí do: ${data.liquidation_note}</p>
      <p class="notification">Hãy kiểm tra lại thông tin phiếu thanh lý.</p>
    `;
  }
  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: `${
      data.liquidation_status === 1 ? "Phê duyệt" : "Từ chối phê duyệt"
    } phiếu thanh lý thiết bị`,
    html: getEmailTemplate(url, "Phiếu thanh lý thiết bị", content),
  };

  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};

module.exports.sendTransferEmail = async (req, data, users) => {
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/equipment/transfer/detail/${data?.equipment_id}/${data?.id}`;
  const content = `
    <p class="notification">Phiếu yêu cầu điều chuyển thiết bị ${
      data?.name
    } thuộc ${data?.from_department} đã được ${
    data.isEdit === 0 ? "tạo mới" : "cập nhật"
  }.</p>
    <p class="notification">Hãy kiểm tra thông tin điều chuyển và phản hồi trên hệ thống!</p>
  `;
  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: `${
      data.isEdit === 0
        ? "Điều chuyển thiết bị"
        : "Cập nhật phiếu điều chuyển thiết bị"
    }`,
    html: getEmailTemplate(url, "Phiếu điều chuyển thiết bị", content),
  };

  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};

module.exports.sendHandleTransferReportEmail = async (req, data, users) => {
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/equipment/transfer/detail/${data?.equipment_id}/${data.id}`;
  let content;
  if (data.transfer_status === 1) {
    content = `
      <p class="notification">Phiếu điều chuyển thiết bị ${data?.name} thuộc ${data?.from_department} sang ${data?.to_department} đã được phê duyệt.</p>
      <p class="notification">Thiết bị sẽ trực thuộc ${data?.to_department} quản lý</p>
    `;
  } else {
    content = `
      <p class="notification">Phiếu điều chuyển thiết bị ${data?.name} thuộc ${data?.from_department} sang ${data?.to_department} đã bị từ chối.</p>
      <p class="notification">Lí do: ${data.transfer_note}</p>
      <p class="notification">Hãy kiểm tra lại thông tin phiếu điều chuyển.</p>
    `;
  }
  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: `${
      data.transfer_status === 1 ? "Phê duyệt" : "Từ chối phê duyệt"
    } phiếu điều chuyển thiết bị`,
    html: getEmailTemplate(url, "Phiếu điều chuyển thiết bị", content),
  };

  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};

module.exports.sendInspectionEmail = async (req, data, users) => {
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/equipment/inspection/detail/${data?.equipment_id}/${data.id}?edit=true`;
  const content = `
    <p class="notification">Phiếu kiểm định thiết bị ${data?.name} thuộc ${
    data?.department
  } đã được ${data.isEdit === 0 ? "tạo mới" : "cập nhật"}.</p>
    <p class="notification">Hãy kiểm tra nội dung kiểm định trong phiếu và thực hiện xác nhận trên hệ thống.</p>
  `;
  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: `${
      data.isEdit === 0
        ? "Kiểm định thiết bị"
        : "Cập nhật phiếu kiểm định thiết bị"
    }`,
    html: getEmailTemplate(url, "Phiếu kiểm định thiết bị", content),
  };

  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};

module.exports.sendHandleInspectionEmail = async (req, data, users) => {
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/equipment/inspection/detail/${data?.equipment_id}/${data?.id}`;
  let content;
  if (data.inspection_status === 1) {
    content = `
      <p class="notification">Phiếu kiểm định của thiết bị ${data?.name} thuộc khoa phòng ${data?.department} đã được phê duyệt.</p>
      <p class="notification">Đại diện phòng vật tư sẽ liên hệ với đơn vị kiểm định.</p>
      <p class="notification">Qui trình kiểm định thiết bị sẽ diễn ra theo đúng kế hoạch trong phiếu kiểm định.</p>
  `;
  } else {
    content = `
      <p class="notification">Phiếu kiểm định của thiết bị ${data?.name} thuộc ${data?.department} đã bị từ chối.</p>
      <p class="notification">Lí do: ${data?.inspection_note}.</p>
      <p class="notification">Hãy kiểm tra lại phiếu kiểm định của thiết bị.</p>
  `;
  }

  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: `${
      data.inspection_status === 1 ? "Phê duyệt" : "Từ chối phê duyệt"
    } phiếu kiểm định thiết bị`,
    html: getEmailTemplate(url, "Phiếu kiểm định thiết bị", content),
  };

  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};

module.exports.sendUnuseEquipmentEmail = async (req, data, users) => {
  const domain = req?.headers?.origin || process.env.URL_REACT;
  if (!domain) throw new Error(err.SEND_MAIL_ERROR.messageCode);
  const url = `${domain}/equipment/liquidation`;
  const content = `
    <p class="notification">Thiết bị ${data?.name} thuộc ${data?.department} đã được chuyển trạng thái ngừng sử dụng để cân nhắc thanh lý.</p>
  `;
  const mailOptions = {
    from: '"MDM-iBME" <mdm.ibme.lab@gmail.com>',
    subject: "Ngừng sử dụng thiết bị",
    html: getEmailTemplate(url, "Thông tin chi tiết", content),
  };

  await Promise.all(
    users.map(async (user) => {
      const userMailOptions = { ...mailOptions, to: user.email };
      try {
        const send = await smtpTrans.sendMail(userMailOptions);
        if (!send) throw new Error(err.SEND_MAIL_ERROR.messageCode);
      } catch (error) {
        throw new Error(err.SEND_MAIL_ERROR.messageCode);
      }
    })
  );
};
