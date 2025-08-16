import FormComponent from '../../components/FormComponent';

function Login() {
  return <FormComponent route="/api/token/" method="login" />;
}

export default Login;
