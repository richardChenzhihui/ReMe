import { MobileOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import { Toast } from "antd-mobile";
import cookie from "react-cookies";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { login } from "@/api";
import Header from "@c/Header";

import "./index.less";

const Login = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
    login(values.phone, values.password)
      .then((useId) => {
        if (values.remember) {
          cookie.save("userId", useId, { path: "/", maxAge: 7 * 86400 });
        } else {
          cookie.save("userId", useId, { path: "/", maxAge: 1800 });
        }
        navigate("/home");
      })
      .catch((err) => {
        Toast.show({
          icon: "fail",
          content: err.message,
        });
      });
  };

  return (
    <div className="page login-page">
      <Header />
      <div className="sub-head">
        <h2 className="sub-head-title">{t("log in")}</h2>
        <p className="sub-head-desc">{t("welcome")}</p>
      </div>

      <Form
        name="login"
        className="login-form"
        size="large"
        onFinish={onFinish}
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
          name="password"
          label={t("password")}
          rules={[
            { required: true, message: t("please enter your password!") },
          ]}
          className="form-item form-item-password"
        >
          <Input.Password placeholder={t("please enter your password")} />
        </Form.Item>

        <Form.Item className="form-item-help">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>{t("remember me")}</Checkbox>
          </Form.Item>

          {/* <a className="login-form-forgot" href="">
            {t("forgot password")}
          </a> */}
        </Form.Item>

        <Form.Item>
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
                            "should accept user agreement and privacy statement!",
                          ),
                        ),
                      ),
              },
            ]}
          >
            <Checkbox className="agreements">
              {t("I have read and agree to")}
              <a className="user-agreement" target="_blank">
                {t("user agreement")}
              </a>
              &
              <a
                className="user-agreement"
                href="https://go.microsoft.com/fwlink/?LinkId=521839"
                target="_blank"
              >
                {t("Privacy Statement")}
              </a>
            </Checkbox>
          </Form.Item>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="default-button login-button"
          >
            {t("log in")}
          </Button>
          <div>
            <span>{t("First time here?")}</span>
            <Link className="register" to="/register">
              {t("register")}
            </Link>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
