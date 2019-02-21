


CREATE TABLE user_mgnt.auth_group (
    id integer NOT NULL,
    name character varying(80) NOT NULL
);

CREATE SEQUENCE user_mgnt.auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE user_mgnt.auth_group_permissions (
    id integer NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);

CREATE SEQUENCE user_mgnt.auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE TABLE user_mgnt.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);

CREATE SEQUENCE user_mgnt.auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE user_mgnt.auth_user (
    id integer NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    username character varying(150) NOT NULL,
    first_name character varying(30) NOT NULL,
    last_name character varying(150) NOT NULL,
    email character varying(254) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL
);

CREATE TABLE user_mgnt.auth_user_groups (
    id integer NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


CREATE SEQUENCE user_mgnt.auth_user_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE SEQUENCE user_mgnt.auth_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE user_mgnt.auth_user_user_permissions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


CREATE SEQUENCE user_mgnt.auth_user_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE user_mgnt.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    content_type_id integer,
    user_id integer NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


CREATE SEQUENCE user_mgnt.django_admin_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE TABLE user_mgnt.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);

CREATE SEQUENCE user_mgnt.django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE user_mgnt.django_migrations (
    id integer NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);

CREATE SEQUENCE user_mgnt.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE TABLE user_mgnt.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


SELECT pg_catalog.setval('user_mgnt.auth_group_id_seq', 1, false);

SELECT pg_catalog.setval('user_mgnt.auth_group_permissions_id_seq', 1, false);


--
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: user_mgnt; Owner: postgres
--

COPY user_mgnt.auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add log entry	1	add_logentry
2	Can change log entry	1	change_logentry
3	Can delete log entry	1	delete_logentry
4	Can view log entry	1	view_logentry
5	Can add permission	2	add_permission
6	Can change permission	2	change_permission
7	Can delete permission	2	delete_permission
8	Can view permission	2	view_permission
9	Can add group	3	add_group
10	Can change group	3	change_group
11	Can delete group	3	delete_group
12	Can view group	3	view_group
13	Can add user	4	add_user
14	Can change user	4	change_user
15	Can delete user	4	delete_user
16	Can view user	4	view_user
17	Can add content type	5	add_contenttype
18	Can change content type	5	change_contenttype
19	Can delete content type	5	delete_contenttype
20	Can view content type	5	view_contenttype
21	Can add session	6	add_session
22	Can change session	6	change_session
23	Can delete session	6	delete_session
24	Can view session	6	view_session
\.

SELECT pg_catalog.setval('user_mgnt.auth_permission_id_seq', 24, true);

COPY user_mgnt.auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) FROM stdin;
1	pbkdf2_sha256$120000$NnAgvHSEx5CU$Fs+Y+4O2bd7c86i0y0WIh8mkup+uzROWkHH6sS54GG0=	\N	t	root				t	t	2019-02-14 12:21:52.141638+03
\.

SELECT pg_catalog.setval('user_mgnt.auth_user_groups_id_seq', 1, false);

SELECT pg_catalog.setval('user_mgnt.auth_user_id_seq', 1, true);
SELECT pg_catalog.setval('user_mgnt.auth_user_user_permissions_id_seq', 1, false);
SELECT pg_catalog.setval('user_mgnt.django_admin_log_id_seq', 1, false);

COPY user_mgnt.django_content_type (id, app_label, model) FROM stdin;
1	admin	logentry
2	auth	permission
3	auth	group
4	auth	user
5	contenttypes	contenttype
6	sessions	session
\.


SELECT pg_catalog.setval('user_mgnt.django_content_type_id_seq', 6, true);


COPY user_mgnt.django_migrations (id, app, name, applied) FROM stdin;
1	contenttypes	0001_initial	2019-02-14 12:16:54.526347+03
2	auth	0001_initial	2019-02-14 12:16:55.460072+03
3	admin	0001_initial	2019-02-14 12:16:55.692489+03
4	admin	0002_logentry_remove_auto_add	2019-02-14 12:16:55.748097+03
5	admin	0003_logentry_add_action_flag_choices	2019-02-14 12:16:55.772891+03
6	contenttypes	0002_remove_content_type_name	2019-02-14 12:16:55.800369+03
7	auth	0002_alter_permission_name_max_length	2019-02-14 12:16:55.822387+03
8	auth	0003_alter_user_email_max_length	2019-02-14 12:16:55.86732+03
9	auth	0004_alter_user_username_opts	2019-02-14 12:16:55.88718+03
10	auth	0005_alter_user_last_login_null	2019-02-14 12:16:55.922569+03
11	auth	0006_require_contenttypes_0002	2019-02-14 12:16:55.933722+03
12	auth	0007_alter_validators_add_error_messages	2019-02-14 12:16:55.980978+03
13	auth	0008_alter_user_username_max_length	2019-02-14 12:16:56.069152+03
14	auth	0009_alter_user_last_name_max_length	2019-02-14 12:16:56.122681+03
15	sessions	0001_initial	2019-02-14 12:16:56.302669+03
\.


SELECT pg_catalog.setval('user_mgnt.django_migrations_id_seq', 15, true);

ALTER TABLE ONLY user_mgnt.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);

ALTER TABLE ONLY user_mgnt.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);

ALTER TABLE ONLY user_mgnt.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY user_mgnt.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);

ALTER TABLE ONLY user_mgnt.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);
ALTER TABLE ONLY user_mgnt.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);

ALTER TABLE ONLY user_mgnt.auth_user_groups
    ADD CONSTRAINT auth_user_groups_pkey PRIMARY KEY (id);

ALTER TABLE ONLY user_mgnt.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_group_id_94350c0c_uniq UNIQUE (user_id, group_id);

ALTER TABLE ONLY user_mgnt.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);

ALTER TABLE ONLY user_mgnt.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY user_mgnt.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_permission_id_14a6b632_uniq UNIQUE (user_id, permission_id);

ALTER TABLE ONLY user_mgnt.auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);


ALTER TABLE ONLY user_mgnt.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY user_mgnt.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


ALTER TABLE ONLY user_mgnt.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


ALTER TABLE ONLY user_mgnt.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);

ALTER TABLE ONLY user_mgnt.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);

CREATE INDEX auth_group_name_a6ea08ec_like ON user_mgnt.auth_group USING btree (name varchar_pattern_ops);

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON user_mgnt.auth_group_permissions USING btree (group_id);

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON user_mgnt.auth_group_permissions USING btree (permission_id);

CREATE INDEX auth_permission_content_type_id_2f476e4b ON user_mgnt.auth_permission USING btree (content_type_id);
CREATE INDEX auth_user_groups_group_id_97559544 ON user_mgnt.auth_user_groups USING btree (group_id);

CREATE INDEX auth_user_groups_user_id_6a12ed8b ON user_mgnt.auth_user_groups USING btree (user_id);

CREATE INDEX auth_user_user_permissions_permission_id_1fbb5f2c ON user_mgnt.auth_user_user_permissions USING btree (permission_id);
CREATE INDEX auth_user_user_permissions_user_id_a95ead1b ON user_mgnt.auth_user_user_permissions USING btree (user_id);

CREATE INDEX auth_user_username_6821ab7c_like ON user_mgnt.auth_user USING btree (username varchar_pattern_ops);


CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON user_mgnt.django_admin_log USING btree (content_type_id);

CREATE INDEX django_admin_log_user_id_c564eba6 ON user_mgnt.django_admin_log USING btree (user_id);


CREATE INDEX django_session_expire_date_a5c62663 ON user_mgnt.django_session USING btree (expire_date);


CREATE INDEX django_session_session_key_c0390e0f_like ON user_mgnt.django_session USING btree (session_key varchar_pattern_ops);


ALTER TABLE ONLY user_mgnt.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES user_mgnt.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


ALTER TABLE ONLY user_mgnt.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES user_mgnt.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


ALTER TABLE ONLY user_mgnt.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES user_mgnt.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY user_mgnt.auth_user_groups
    ADD CONSTRAINT auth_user_groups_group_id_97559544_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES user_mgnt.auth_group(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY user_mgnt.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_6a12ed8b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES user_mgnt.auth_user(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY user_mgnt.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES user_mgnt.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY user_mgnt.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES user_mgnt.auth_user(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE ONLY user_mgnt.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES user_mgnt.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE ONLY user_mgnt.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES user_mgnt.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


ALTER TABLE user_mgnt.auth_group OWNER TO postgres;
ALTER TABLE user_mgnt.auth_group_id_seq OWNER TO postgres;
ALTER SEQUENCE user_mgnt.auth_group_id_seq OWNED BY user_mgnt.auth_group.id;
ALTER TABLE user_mgnt.auth_group_permissions OWNER TO postgres;
ALTER TABLE user_mgnt.auth_group_permissions_id_seq OWNER TO postgres;
ALTER SEQUENCE user_mgnt.auth_group_permissions_id_seq OWNED BY user_mgnt.auth_group_permissions.id;
ALTER TABLE user_mgnt.auth_permission OWNER TO postgres;
ALTER TABLE user_mgnt.auth_permission_id_seq OWNER TO postgres;
ALTER SEQUENCE user_mgnt.auth_permission_id_seq OWNED BY user_mgnt.auth_permission.id;
ALTER TABLE user_mgnt.auth_user OWNER TO postgres;
ALTER TABLE user_mgnt.auth_user_groups OWNER TO postgres;
ALTER TABLE user_mgnt.auth_user_groups_id_seq OWNER TO postgres;
ALTER SEQUENCE user_mgnt.auth_user_groups_id_seq OWNED BY user_mgnt.auth_user_groups.id;
ALTER TABLE user_mgnt.auth_user_id_seq OWNER TO postgres;
ALTER SEQUENCE user_mgnt.auth_user_id_seq OWNED BY user_mgnt.auth_user.id;
ALTER TABLE user_mgnt.auth_user_user_permissions OWNER TO postgres;
ALTER TABLE user_mgnt.auth_user_user_permissions_id_seq OWNER TO postgres;
ALTER SEQUENCE user_mgnt.auth_user_user_permissions_id_seq OWNED BY user_mgnt.auth_user_user_permissions.id;
ALTER TABLE user_mgnt.django_admin_log OWNER TO postgres;
ALTER TABLE user_mgnt.django_admin_log_id_seq OWNER TO postgres;
ALTER SEQUENCE user_mgnt.django_admin_log_id_seq OWNED BY user_mgnt.django_admin_log.id;
ALTER TABLE user_mgnt.django_content_type OWNER TO postgres;
ALTER TABLE user_mgnt.django_content_type_id_seq OWNER TO postgres;
ALTER SEQUENCE user_mgnt.django_content_type_id_seq OWNED BY user_mgnt.django_content_type.id;
ALTER TABLE user_mgnt.django_session OWNER TO postgres;
ALTER TABLE ONLY user_mgnt.auth_group ALTER COLUMN id SET DEFAULT nextval('user_mgnt.auth_group_id_seq'::regclass);
ALTER TABLE ONLY user_mgnt.auth_group_permissions ALTER COLUMN id SET DEFAULT nextval('user_mgnt.auth_group_permissions_id_seq'::regclass);
ALTER TABLE ONLY user_mgnt.auth_permission ALTER COLUMN id SET DEFAULT nextval('user_mgnt.auth_permission_id_seq'::regclass);
ALTER TABLE ONLY user_mgnt.auth_user ALTER COLUMN id SET DEFAULT nextval('user_mgnt.auth_user_id_seq'::regclass);
ALTER TABLE ONLY user_mgnt.auth_user_groups ALTER COLUMN id SET DEFAULT nextval('user_mgnt.auth_user_groups_id_seq'::regclass);
ALTER TABLE ONLY user_mgnt.auth_user_user_permissions ALTER COLUMN id SET DEFAULT nextval('user_mgnt.auth_user_user_permissions_id_seq'::regclass);
ALTER TABLE ONLY user_mgnt.django_admin_log ALTER COLUMN id SET DEFAULT nextval('user_mgnt.django_admin_log_id_seq'::regclass);
ALTER TABLE ONLY user_mgnt.django_content_type ALTER COLUMN id SET DEFAULT nextval('user_mgnt.django_content_type_id_seq'::regclass);
ALTER TABLE ONLY user_mgnt.django_migrations ALTER COLUMN id SET DEFAULT nextval('user_mgnt.django_migrations_id_seq'::regclass);
ALTER TABLE user_mgnt.django_migrations OWNER TO postgres;
ALTER TABLE user_mgnt.django_migrations_id_seq OWNER TO postgres;
ALTER SEQUENCE user_mgnt.django_migrations_id_seq OWNED BY user_mgnt.django_migrations.id;


