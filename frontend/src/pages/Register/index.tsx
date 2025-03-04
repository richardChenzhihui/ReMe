import {
  CalendarOutlined,
  MobileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Radio } from "antd";
import { DatePicker, Toast } from "antd-mobile";
import { useState } from "react";
import cookie from "react-cookies";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { register } from "@/api";
import Header from "@c/Header";
import SuccessRegistration from "@c/SuccessRegistration";

import "../Login/index.less";
import "./index.less";

const now = new Date();

const Register = () => {
  const { t } = useTranslation("common");
  const [success, setSuccess] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [form] = Form.useForm();
  const birthday = Form.useWatch("birthday", { form, preserve: true });

  const genderOptions = [
    { label: t("female"), value: "female" },
    { label: t("male"), value: "male" },
    { label: t("confidential"), value: "unknown" },
  ];

  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
    const arr = values.birthday.split("-");

    register({
      phone: values.phone,
      password: values.password,
      name: values.name,
      gender: values.gender,
      birthdate_year: arr[0],
      birthdate_month: arr[1],
    })
      .then((useId) => {
        console.log(useId);
        setSuccess(true);
        cookie.save("userId", useId, { path: "/", maxAge: 86400 });
      })
      .catch((err) => {
        Toast.show({
          icon: "fail",
          content: err.message,
        });
      });
  };

  if (success) {
    return <SuccessRegistration />;
  }

  return (
    <div className="page register-page">
      <Header />
      <Form
        form={form}
        name="register"
        className="login-form register-form"
        size="large"
        onFinish={onFinish}
        autoComplete="off"
        scrollToFirstError
      >
        <Form.Item
          name="phone"
          label={t("your phone number")}
          rules={[
            { required: true, message: t("please enter your phone number!") },
          ]}
          className="form-item"
        >
          <Input
            prefix={<MobileOutlined className="site-form-item-icon" />}
            placeholder={t("please enter your phone number")}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label={t("your name")}
          rules={[{ required: true, message: t("please enter your name!") }]}
          className="form-item"
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder={t("please enter your name")}
          />
        </Form.Item>

        <Form.Item
          name="birthday"
          label={t("birthday")}
          rules={[
            { required: true, message: t("please enter your birthday!") },
            {
              validator: (_, value) =>
                value.split("-").length === 2
                  ? Promise.resolve()
                  : Promise.reject(new Error(t("please enter your birthday!"))),
            },
          ]}
          className="form-item"
        >
          <Input
            value={birthday}
            prefix={<CalendarOutlined />}
            placeholder={t("year-month")}
            inputMode="none"
            style={{ caretColor: "transparent" }}
            onClick={() => {
              setDatePickerVisible(true);
            }}
            onChange={(event) => {
              console.log("onChange", event);
            }}
          />
        </Form.Item>
        <DatePicker
          title={t("birthday")}
          precision="month"
          visible={datePickerVisible}
          onClose={() => {
            setDatePickerVisible(false);
          }}
          min={new Date(1900, 0)}
          max={now}
          defaultValue={new Date(1960, 0)}
          onConfirm={(val) => {
            form.setFieldsValue({
              birthday:
                val.getFullYear() +
                "-" +
                String(val.getMonth() + 1).padStart(2, "0"),
            });
          }}
        />

        <Form.Item
          name="gender"
          label={t("gender")}
          rules={[{ required: true, message: t("please enter your gender!") }]}
          className="form-item"
        >
          <Radio.Group options={genderOptions} className="gender-options" />
        </Form.Item>

        <Form.Item
          name="password"
          label={t("password")}
          rules={[
            { required: true, message: t("please enter your password!") },
          ]}
          className="form-item form-item-password"
        >
          <Input.Password placeholder={t("please enter your password")} />
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error(
                        t(
                          "should accept user agreement and pravicy statement!",
                        ),
                      ),
                    ),
            },
          ]}
        >
          <Checkbox className="agreements">
            {t("I have read and agree to")}
            <a className="user-agreement">{t("user agreement")}</a>&
            <a className="user-agreement">{t("pravicy statement")}</a>
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="default-button login-button"
          >
            {t("finish registration")}
          </Button>
          <div>
            <span>{t("Already have an account?")}</span>
            <Link className="register" to="/login">
              {t("log in")}
            </Link>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
