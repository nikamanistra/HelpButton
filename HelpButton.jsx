import { useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { setAlert } from '../../actions/alert';
import classes from './HelpButton.module.css';
import { FiHelpCircle } from 'react-icons/fi';
import { GrClose, GrUserManager } from 'react-icons/gr';
import {
  getHelpBtnSubject,
  helpBtnFields,
  validateHelpBtnForm
} from './HelpButton.service';
import { useRef } from 'react';
import { getEmailBody } from '../../utils/global.services';
import { sendEmail } from '../../actions/user';
import { TextEditor } from '../../UI/TextEditor/TextEditor';
import { Button, buttonTypes } from '../../UI/Button/Button';

const HelpButton = ({ auth: { user, emailLoading }, setAlert, sendEmail }) => {
  const textEditor = useRef(null);
  const [files, setAttachments] = useState([]);
  const [isOpen, setOpen] = useState(false);
  const [formData, setFormData] = useState(
    helpBtnFields.map((field) => ({
      value: '',
      isValid: true,
      ...field
    }))
  );
  const filesLimit = useMemo(() => 3, []);
  const fileTypes = useMemo(
    () => ['jpg', 'jpeg', 'png', 'gif', 'csv', 'pdf', 'txt'],
    []
  );

  const openForm = () => setOpen(!isOpen);

  const changeDescription = (e) => {
    setFormData(
      formData.map((data) => {
        if (data.name === 'question') {
          data.value = e.target.innerHTML;
        }
        return data;
      })
    );
  };

  const submitForm = async () => {
    const isValid = validateHelpBtnForm(formData, setFormData);
    if (isValid) {
      const mailData = {
        body: getEmailBody({
          data: [
            { label: 'Email', value: user.email },
            { label: 'Vendor Name', value: user.vendorname },
            ...formData
          ]
        }),
        subject: getHelpBtnSubject(user)
      };
      if (files.length) mailData.files = files;

      const res = await sendEmail({ data: mailData, hideAlert: true });
      if (res) {
        setFormData(
          formData.map((field) => {
            field.value = '';
            return field;
          })
        );
        if (textEditor.current) textEditor.current.innerHTML = '';
        setAttachments([]);
        setAlert(`We've received your email!`, 'success', 7000);
      } else {
        setAlert(
          'There was an error trying to send your message. Please try again.',
          'error',
          7000
        );
      }
    } else {
      setAlert('Some required fields are empty or incorrect', 'error', 5000);
    }
  };

  //if (user.role !== roles.vendor) return null;

  return (
    <div>
      <div
        className={`${classes.helpForm} ${
          !isOpen ? classes.helpFormDisabled : ''
        }`}
      >
        <h2 className={classes.helpButtonHeader}>How can we help?</h2>
        <div className={classes.helpFormBody}>
          <div className={classes.helpFormUser}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="user avatar"
                className={classes.helpUserAvatar}
              />
            ) : (
              <div className={classes.helpUserIconBox}>
                <GrUserManager className={classes.helpUserIcon} />
              </div>
            )}
            <div className={classes.helpFormUserInfo}>
              <p className={classes.helpFormUserName}>{user.vendorname}</p>
              <p className={classes.helpFormUserEmail}>{user.email}</p>
            </div>
          </div>
          <ul className={classes.helpButtonList}>
            {formData.map((field) => (
              <li key={field.name}>
                {field.type === 'texteditor' ? (
                  <TextEditor
                    containerClassName={classes.helpButtonTextContainer}
                    isValid={field.isValid}
                    onChange={changeDescription}
                    placeholder={field.placeholder}
                    editorRef={textEditor}
                    files={files}
                    fileTypes={fileTypes}
                    filesLimit={filesLimit}
                    setAttachments={setAttachments}
                    setAlert={setAlert}
                    loading={emailLoading}
                    error={field.isValid ? '' : 'required'}
                  />
                ) : null}
              </li>
            ))}
          </ul>
          <Button
            className={classes.helpButtonSubmit}
            buttonType={buttonTypes.SECONDARY}
            onClick={submitForm}
            disabled={emailLoading}
            loading={emailLoading}
          >
            Submit
          </Button>
        </div>
      </div>
      <button
        className={`${classes.helpButton} ${isOpen && classes.helpButtonClose}`}
        onClick={openForm}
      >
        {isOpen ? (
          <GrClose className={classes.helpButtonCloseIcon} />
        ) : (
          <FiHelpCircle className={classes.helpButtonIcon} />
        )}
      </button>
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps, { setAlert, sendEmail })(HelpButton);
