import React from 'react';

function SectionStatus({
  enabled,
  enabledText = 'Sección activa',
  disabledText = 'Sección desactivada'
}) {
  return (
    <span
      className={
        enabled ? 'status-badge enabled' : 'status-badge disabled'
      }
    >
      {enabled ? enabledText : disabledText}
    </span>
  );
}

function SubsectionHeader({
  eyebrow,
  title,
  description,
  enabled,
  sectionKey,
  onToggleSection
}) {
  function handleToggle() {
    if (typeof onToggleSection === 'function') {
      onToggleSection(sectionKey);
    }
  }

  return (
    <div className="subsection-header">
      <div>
        <span className="section-eyebrow">{eyebrow}</span>

        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <div className="subsection-header-actions">
        <SectionStatus enabled={enabled} />

        {typeof onToggleSection === 'function' && (
          <button
            type="button"
            className={
              enabled
                ? 'secondary-button compact-button'
                : 'primary-button compact-button'
            }
            onClick={handleToggle}
          >
            {enabled ? 'Desactivar' : 'Activar'}
          </button>
        )}
      </div>
    </div>
  );
}

function DisabledNotice({ children }) {
  return <div className="inline-notice">{children}</div>;
}

export default function ContentTab({
  formData,
  handleChange,
  onToggleSection
}) {
  const sections = formData?.sections || {};

  const parentsEnabled = Boolean(sections.parents);
  const storyEnabled = Boolean(sections.story);
  const dressCodeEnabled = Boolean(sections.dressCode);
  const giftsEnabled = Boolean(sections.gifts);
  const guestBookEnabled = Boolean(sections.guestBook);

  return (
    <div className="builder-tab content-tab">
      <div className="tab-heading">
        <div>
          <span className="section-eyebrow">
            Contenido personalizado
          </span>

          <h2>Información especial de la pareja</h2>

          <p>
            Personaliza los padres, la historia, el código de vestimenta,
            los regalos y el libro de firmas.
          </p>
        </div>
      </div>

      <section className="builder-subsection">
        <SubsectionHeader
          eyebrow="Familia"
          title="Padres de los novios"
          description="Agrega los nombres de los padres que aparecerán en la invitación."
          enabled={parentsEnabled}
          sectionKey="parents"
          onToggleSection={onToggleSection}
        />

        {!parentsEnabled && (
          <DisabledNotice>
            Esta sección está desactivada. Los nombres de los padres no
            aparecerán en la invitación.
          </DisabledNotice>
        )}

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="groomFather">
              Padre del novio
            </label>

            <input
              id="groomFather"
              type="text"
              name="groomFather"
              value={formData?.groomFather || ''}
              onChange={handleChange}
              placeholder="Nombre completo"
              maxLength="120"
              disabled={!parentsEnabled}
            />
          </div>

          <div className="form-field">
            <label htmlFor="groomMother">
              Madre del novio
            </label>

            <input
              id="groomMother"
              type="text"
              name="groomMother"
              value={formData?.groomMother || ''}
              onChange={handleChange}
              placeholder="Nombre completo"
              maxLength="120"
              disabled={!parentsEnabled}
            />
          </div>

          <div className="form-field">
            <label htmlFor="brideFather">
              Padre de la novia
            </label>

            <input
              id="brideFather"
              type="text"
              name="brideFather"
              value={formData?.brideFather || ''}
              onChange={handleChange}
              placeholder="Nombre completo"
              maxLength="120"
              disabled={!parentsEnabled}
            />
          </div>

          <div className="form-field">
            <label htmlFor="brideMother">
              Madre de la novia
            </label>

            <input
              id="brideMother"
              type="text"
              name="brideMother"
              value={formData?.brideMother || ''}
              onChange={handleChange}
              placeholder="Nombre completo"
              maxLength="120"
              disabled={!parentsEnabled}
            />
          </div>
        </div>
      </section>

      <div className="builder-divider" />

      <section className="builder-subsection">
        <SubsectionHeader
          eyebrow="La pareja"
          title="Nuestra historia"
          description="Cuenta cómo se conocieron o escribe un mensaje especial sobre su historia."
          enabled={storyEnabled}
          sectionKey="story"
          onToggleSection={onToggleSection}
        />

        {!storyEnabled && (
          <DisabledNotice>
            La historia está desactivada y no aparecerá en la
            invitación.
          </DisabledNotice>
        )}

        <div className="form-grid">
          <div className="form-field form-field-full">
            <label htmlFor="storyTitle">
              Título de la historia
            </label>

            <input
              id="storyTitle"
              type="text"
              name="storyTitle"
              value={formData?.storyTitle || ''}
              onChange={handleChange}
              placeholder="Ejemplo: Nuestra historia"
              maxLength="100"
              disabled={!storyEnabled}
            />
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="storyText">
              Historia de la pareja
            </label>

            <textarea
              id="storyText"
              name="storyText"
              rows="8"
              value={formData?.storyText || ''}
              onChange={handleChange}
              placeholder="Cuenta cómo se conocieron, momentos importantes o lo que representa este día para ustedes."
              maxLength="2000"
              disabled={!storyEnabled}
            />

            <div className="field-counter">
              <small>
                Puedes escribir una historia diferente para cada pareja.
              </small>

              <span>
                {(formData?.storyText || '').length}/2000
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="builder-divider" />

      <section className="builder-subsection">
        <SubsectionHeader
          eyebrow="Vestimenta"
          title="Código de vestimenta"
          description="Escribe exactamente el código de vestimenta que deseas mostrar."
          enabled={dressCodeEnabled}
          sectionKey="dressCode"
          onToggleSection={onToggleSection}
        />

        {!dressCodeEnabled && (
          <DisabledNotice>
            El código de vestimenta está desactivado y no se mostrará
            en la invitación.
          </DisabledNotice>
        )}

        <div className="form-grid">
          <div className="form-field form-field-full">
            <label htmlFor="dressCodeTitle">
              Tipo de vestimenta
            </label>

            <input
              id="dressCodeTitle"
              type="text"
              name="dressCodeTitle"
              value={formData?.dressCodeTitle || ''}
              onChange={handleChange}
              placeholder="Ejemplo: Formal, etiqueta, casual elegante..."
              maxLength="100"
              disabled={!dressCodeEnabled}
            />

            <small>
              La invitación mostrará exactamente lo que escribas aquí.
            </small>
          </div>

          <div className="form-field">
            <label htmlFor="dressCodeWomen">
              Recomendación para mujeres
            </label>

            <input
              id="dressCodeWomen"
              type="text"
              name="dressCodeWomen"
              value={formData?.dressCodeWomen || ''}
              onChange={handleChange}
              placeholder="Ejemplo: Vestido largo"
              maxLength="180"
              disabled={!dressCodeEnabled}
            />
          </div>

          <div className="form-field">
            <label htmlFor="dressCodeMen">
              Recomendación para hombres
            </label>

            <input
              id="dressCodeMen"
              type="text"
              name="dressCodeMen"
              value={formData?.dressCodeMen || ''}
              onChange={handleChange}
              placeholder="Ejemplo: Traje oscuro"
              maxLength="180"
              disabled={!dressCodeEnabled}
            />
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="dressCodeNotes">
              Indicaciones adicionales
            </label>

            <textarea
              id="dressCodeNotes"
              name="dressCodeNotes"
              rows="4"
              value={formData?.dressCodeNotes || ''}
              onChange={handleChange}
              placeholder="Ejemplo: Evitar el color blanco."
              maxLength="500"
              disabled={!dressCodeEnabled}
            />

            <div className="field-counter">
              <small>
                Este campo es opcional.
              </small>

              <span>
                {(formData?.dressCodeNotes || '').length}/500
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="builder-divider" />

      <section className="builder-subsection">
        <SubsectionHeader
          eyebrow="Obsequios"
          title="Mesa de regalos"
          description="Agrega un mensaje para los invitados y, si lo deseas, información bancaria."
          enabled={giftsEnabled}
          sectionKey="gifts"
          onToggleSection={onToggleSection}
        />

        {!giftsEnabled && (
          <DisabledNotice>
            La mesa de regalos está desactivada. No aparecerá información
            de regalos ni datos bancarios.
          </DisabledNotice>
        )}

        <div className="form-grid">
          <div className="form-field form-field-full">
            <label htmlFor="giftMessage">
              Mensaje para los invitados
            </label>

            <textarea
              id="giftMessage"
              name="giftMessage"
              rows="5"
              value={formData?.giftMessage || ''}
              onChange={handleChange}
              placeholder="Escribe aquí el mensaje que deseas mostrar."
              maxLength="700"
              disabled={!giftsEnabled}
            />

            <div className="field-counter">
              <small>
                La información bancaria es opcional.
              </small>

              <span>
                {(formData?.giftMessage || '').length}/700
              </span>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="bankName">
              Banco
            </label>

            <input
              id="bankName"
              type="text"
              name="bankName"
              value={formData?.bankName || ''}
              onChange={handleChange}
              placeholder="Nombre del banco"
              maxLength="100"
              disabled={!giftsEnabled}
            />
          </div>

          <div className="form-field">
            <label htmlFor="accountHolder">
              Titular de la cuenta
            </label>

            <input
              id="accountHolder"
              type="text"
              name="accountHolder"
              value={formData?.accountHolder || ''}
              onChange={handleChange}
              placeholder="Nombre completo"
              maxLength="150"
              disabled={!giftsEnabled}
            />
          </div>

          <div className="form-field">
            <label htmlFor="accountNumber">
              Número de cuenta
            </label>

            <input
              id="accountNumber"
              type="text"
              name="accountNumber"
              value={formData?.accountNumber || ''}
              onChange={handleChange}
              placeholder="Número de cuenta"
              inputMode="numeric"
              maxLength="30"
              disabled={!giftsEnabled}
            />
          </div>

          <div className="form-field">
            <label htmlFor="clabe">
              CLABE interbancaria
            </label>

            <input
              id="clabe"
              type="text"
              name="clabe"
              value={formData?.clabe || ''}
              onChange={handleChange}
              placeholder="18 dígitos"
              inputMode="numeric"
              maxLength="18"
              disabled={!giftsEnabled}
            />

            <small>
              La CLABE debe contener exactamente 18 números.
            </small>
          </div>
        </div>
      </section>

      <div className="builder-divider" />

      <section className="builder-subsection">
        <SubsectionHeader
          eyebrow="Recuerdos"
          title="Libro de firmas"
          description="Permite que familiares y amigos dejen mensajes para los novios."
          enabled={guestBookEnabled}
          sectionKey="guestBook"
          onToggleSection={onToggleSection}
        />

        {!guestBookEnabled && (
          <DisabledNotice>
            El libro de firmas está desactivado. Los invitados no
            podrán escribir mensajes.
          </DisabledNotice>
        )}

        <div className="form-grid">
          <div className="form-field form-field-full">
            <label htmlFor="guestBookTitle">
              Título del libro de firmas
            </label>

            <input
              id="guestBookTitle"
              type="text"
              name="guestBookTitle"
              value={formData?.guestBookTitle || ''}
              onChange={handleChange}
              placeholder="Ejemplo: Libro de firmas"
              maxLength="120"
              disabled={!guestBookEnabled}
            />

            <small>
              En la invitación los invitados podrán escribir primero su
              mensaje para los novios y después su nombre o el nombre de
              su familia.
            </small>
          </div>
        </div>
      </section>
    </div>
  );
}